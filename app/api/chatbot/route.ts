import { NextRequest } from "next/server";
import { z } from "zod";
import { chatbotGraph } from "@/lib/chatbot/graph";
import { limiter, enforceLimit, clientIp } from "@/lib/rate-limit";
import { RateLimitError } from "@/lib/errors"; // adjust path/name if different in your errors.ts
import { log } from "@/lib/logger";

export const runtime = "nodejs";

const requestSchema = z.object({
  threadId: z.string().uuid(),
  message: z.string().min(1).max(1000),
});

// Two-tier: burst control (typing bursts) + daily quota protection,
// since this hits Groq/Gemini free-tier limits. Follows the same
// limiter() pattern as signupLimiter/signinLimiter etc. in rate-limit.ts.
const chatbotBurstLimiter = () =>
  limiter({ requests: 10, window: "1 m", prefix: "rl:chatbot-burst" });
const chatbotDailyLimiter = () =>
  limiter({ requests: 200, window: "1 d", prefix: "rl:chatbot-daily" });

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  try {
    await enforceLimit(chatbotBurstLimiter(), ip);
    await enforceLimit(chatbotDailyLimiter(), ip);
  } catch (err) {
    if (err instanceof RateLimitError) {
      // NOTE: assumed a `retryAfterSec` field on RateLimitError, matching
      // how it's constructed in rate-limit.ts (`new RateLimitError(retryAfterSec)`).
      // Check errors.ts and adjust this field name if it differs.
      const retryAfterSec = (err as any).retryAfterSec ?? 60;
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please slow down." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSec) },
      });
    }
    throw err;
  }

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { threadId, message } = parsed.data;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const eventStream = await chatbotGraph.stream(
          { messages: [{ role: "user", content: message }] },
          { configurable: { thread_id: threadId }, streamMode: "messages" },
        );

        for await (const [chunk, metadata] of eventStream as any) {
          // Surface a status event while a tool is running, since there's
          // nothing to stream token-by-token during a Mongo/search call.
          if (metadata?.langgraph_node === "tools") {
            controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ status: "searching" })}\n\n`));
            continue;
          }
          if (chunk?.content) {
            controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ content: chunk.content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      } catch (err) {
        log.error("chatbot stream error", {
          threadId,
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Something went wrong." })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}