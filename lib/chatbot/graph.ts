import { ChatGroq } from "@langchain/groq";
import { StateGraph, MessagesAnnotation, END, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ToolMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { chatbotTools } from "./tools";

const SYSTEM_PROMPT = `You are the public assistant for the robotics club website.

Rules you must always follow:
- Only answer club-specific questions (projects, teams, events, competitions, members) using tool results. Never guess or use general knowledge for these.
- If the user asks about a specific named event, competition, or topic (e.g. "what is X", "tell me about X", "what happened at X"), you MUST call searchMagazine with that name before answering, even if another tool already returned a related result. Do not describe, define, or explain what an event/competition involves unless that description came directly from a tool result — describing it from general knowledge is not allowed, even if the description sounds plausible.
- Only state facts that are explicitly present in tool results. Do not add explanatory detail, context, or elaboration that isn't in the returned text, even to make the answer more complete or helpful-sounding.
- Never reveal or speculate about emails, phone numbers, passwords, or any private contact info, even if asked directly or indirectly.
- If searchMagazine returns no results, say the magazine archive doesn't have information on that yet — do not fabricate an answer.
- When citing magazine content, always mention the year and page number, in plain text (e.g. "per the 2025 issue, page 30"), not bracket-style citation markers.
- If a tool call fails validation twice for the same request, stop retrying and tell the user you couldn't find that, and ask them to rephrase.
- Keep answers concise and friendly.`;

const model = new ChatGroq({
  model: "openai/gpt-oss-20b", // swapped from llama-3.3-70b-versatile to test tool-call reliability
  temperature: 0,
})
  .bindTools(chatbotTools)
  // Groq's llama-3.3-70b-versatile intermittently emits a malformed tool-call
  // string that Groq's API itself rejects with a 400 before it ever reaches
  // LangChain (community-reported, nondeterministic — same prompt can pass
  // or fail across runs). A short retry absorbs this without user-visible
  // failure in most cases.
  .withRetry({ stopAfterAttempt: 3 });

async function agentNode(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const hasSystemMessage = messages.some((m) => m.getType?.() === "system");
  const input = hasSystemMessage ? messages : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  const response = await model.invoke(input as any);
  return { messages: [response] };
}

// ToolNode executes the registered tools; Zod validation inside each tool
// schema throws on bad args, which LangGraph turns into a ToolMessage error
// that flows back to the agent instead of crashing the request.
const toolNode = new ToolNode(chatbotTools);

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as any;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

const graphBuilder = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, { tools: "tools", [END]: END })
  .addEdge("tools", "agent");

// Swap MemorySaver for a Redis-backed checkpointer in production so
// multi-turn history survives across requests/instances, keyed by threadId.
// (No official @langchain/langgraph Redis saver as of writing — either wrap
// lib/redis.ts behind the BaseCheckpointSaver interface, or use Postgres/Mongo
// checkpoint savers if one of those becomes preferable later.)
const checkpointer = new MemorySaver();

export const chatbotGraph = graphBuilder.compile({ checkpointer });