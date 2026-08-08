"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  status?: "searching" | "error";
}

const THREAD_STORAGE_KEY = "chatbot_thread_id";

function getOrCreateThreadId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(THREAD_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(THREAD_STORAGE_KEY, id);
  }
  return id;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const threadIdRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    threadIdRef.current = getOrCreateThreadId();
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Delay focus slightly so it doesn't fight the open animation.
      const t = setTimeout(() => inputRef.current?.focus(), prefersReducedMotion ? 0 : 200);
      return () => clearTimeout(t);
    }
  }, [isOpen, prefersReducedMotion]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, prefersReducedMotion]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: threadIdRef.current, message: trimmed }),
      });

      if (res.status === 429) {
        updateAssistant(assistantId, "You're sending messages a bit fast — please wait a moment and try again.", "error");
        return;
      }
      if (!res.ok || !res.body) {
        updateAssistant(assistantId, "Something went wrong. Please try again.", "error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          if (!raw.trim()) continue;
          const eventType = raw.match(/^event: (.+)$/m)?.[1] ?? "message";
          const dataMatch = raw.match(/^data: (.+)$/m);
          const data = dataMatch ? JSON.parse(dataMatch[1]) : {};

          if (eventType === "token") {
            content += data.content ?? "";
            updateAssistant(assistantId, content);
          } else if (eventType === "status") {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, status: "searching" } : m)),
            );
          } else if (eventType === "error") {
            updateAssistant(assistantId, data.error ?? "Something went wrong.", "error");
          }
        }
      }
    } catch {
      updateAssistant(assistantId, "Connection lost. Please try again.", "error");
    } finally {
      setIsStreaming(false);
    }
  }

  function updateAssistant(id: string, content: string, status?: ChatMessage["status"]) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content, status } : m)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Floating action button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-[var(--accent)] text-white shadow-lg",
          "hover:bg-[var(--accent-hover)] transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--accent-muted)]",
        )}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            initial={prefersReducedMotion ? undefined : { opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Club chat assistant"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden",
              "inset-0 sm:inset-auto sm:bottom-24 sm:right-6",
              "sm:h-[600px] sm:w-[380px] sm:rounded-2xl sm:border sm:shadow-2xl",
              "bg-[var(--bg)] border-[var(--border)]",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-subtle)]">
                  <Bot className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="font-display text-lg leading-none tracking-wide text-[var(--fg)]">Club Assistant</p>
                  <p className="text-xs text-[var(--fg-secondary)]">Ask about projects, events & more</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-[var(--fg-secondary)]",
                  "hover:bg-[var(--bg-tertiary)] hover:text-[var(--fg)] transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--accent-muted)]",
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[var(--fg-secondary)]">
                  <Bot className="h-8 w-8 text-[var(--fg-tertiary)]" />
                  <p className="text-sm">Ask me about club projects, events, teams, or the magazine archive.</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-[var(--accent)] text-white rounded-br-md"
                        : "bg-[var(--bg-secondary)] text-[var(--fg)] rounded-bl-md",
                      m.status === "error" && "border border-destructive/40",
                    )}
                  >
                    {m.role === "assistant" && m.status === "searching" && !m.content && (
                      <span className="flex items-center gap-1.5 text-[var(--fg-secondary)]">
                        <SearchingDots />
                        Searching...
                      </span>
                    )}
                    {m.content && (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed dark:prose-invert">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--border)] p-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isStreaming}
                aria-label="Message"
                className="h-11 flex-1 rounded-full"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isStreaming || !input.trim()}
                aria-label="Send message"
                className="h-11 w-11 shrink-0 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchingDots() {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--fg-tertiary)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}