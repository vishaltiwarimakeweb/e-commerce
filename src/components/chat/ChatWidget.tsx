"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEveAgent } from "eve/react";
import type { EveMessage } from "eve/react";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";

const STORAGE_KEY = "woozi-shopwise-chat";

interface SavedChat {
  events?: readonly HandleMessageStreamEvent[];
  session?: SessionState;
}

// Lazy initializer so this only ever touches localStorage in the browser —
// it runs once per mount, and returns {} during SSR where window is undefined.
function loadSavedChat(): SavedChat {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedChat) : {};
  } catch {
    return {};
  }
}

function messageText(message: EveMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [saved] = useState<SavedChat>(loadSavedChat);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agent = useEveAgent({
    initialEvents: saved.events,
    initialSession: saved.session,
    onFinish(snapshot) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: snapshot.events, session: snapshot.session }),
      );
    },
  });

  const isBusy = agent.status === "submitted" || agent.status === "streaming";

  // Smooth auto-scroll to the latest message, both on opening the widget and
  // as new messages/streamed text arrive.
  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [isOpen, agent.data.messages]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isBusy) return;
    setInput("");
    void agent.send({ message });
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6">
      {isOpen && (
        <div className="mb-3 flex h-[32rem] max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">ShopWise</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {agent.data.messages.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ask me about products, prices, or for a recommendation — I&apos;ll search the
                catalog for you.
              </p>
            )}

            {agent.data.messages.map((message) => {
              const text = messageText(message);
              if (!text) return null;
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      isUser
                        ? "rounded-br-sm bg-emerald-600 text-white"
                        : "rounded-bl-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              );
            })}

            {agent.status === "submitted" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Thinking…
                </div>
              </div>
            )}

            {agent.status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {agent.error?.message ?? "Something went wrong. Please try again."}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isBusy}
              placeholder="Ask ShopWise…"
              className="flex-1 rounded-full border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100"
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              aria-label="Send message"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close ShopWise chat" : "Open ShopWise chat"}
        className="flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700"
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
