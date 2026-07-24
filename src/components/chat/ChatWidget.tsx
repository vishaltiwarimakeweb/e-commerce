"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEveAgent } from "eve/react";
import type { EveMessage } from "eve/react";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";
import { useAuth } from "@/components/layout/AuthProvider";
import { replayChatSession } from "@/lib/eveReplay";
import type { ChatSessionPointer } from "@/lib/chatSession";

const STORAGE_PREFIX = "woozi-shopwise-chat";

interface SavedChat {
  events?: readonly HandleMessageStreamEvent[];
  session?: SessionState;
}

// Scoped per user (and "guest" when signed out) so a shared browser never
// shows one account's conversation to the next person who uses it.
function storageKey(userId: string | undefined): string {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

function loadSavedChat(key: string): SavedChat {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
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
  const { user } = useAuth();
  const key = storageKey(user?.id);
  const [isOpen, setIsOpen] = useState(false);

  // Resolves what to seed useEveAgent with: the local cache if this device
  // already has one, otherwise (signed-in users only) a cross-device pointer
  // fetched from the server and replayed via eve's own durable session store.
  const [resolved, setResolved] = useState<{ key: string; ready: boolean; initial: SavedChat }>({
    key: "",
    ready: false,
    initial: {},
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialChat() {
      const local = loadSavedChat(key);
      if (local.session || !user) {
        if (!cancelled) setResolved({ key, ready: true, initial: local });
        return;
      }

      try {
        const res = await fetch("/api/chat-session", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        const pointer = data?.pointer as ChatSessionPointer | null;
        if (pointer) {
          const events = await replayChatSession(pointer);
          if (!cancelled) {
            setResolved({
              key,
              ready: true,
              initial: { events, session: { ...pointer, streamIndex: events.length } },
            });
          }
          return;
        }
      } catch {
        // Best-effort resume — fall through to a fresh conversation.
      }
      if (!cancelled) setResolved({ key, ready: true, initial: {} });
    }

    void resolveInitialChat();

    return () => {
      cancelled = true;
    };
  }, [key, user]);

  return (
    <div className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6">
      {isOpen &&
        (resolved.ready && resolved.key === key ? (
          <ChatPanel
            key={key}
            storageKey={key}
            userId={user?.id}
            initialEvents={resolved.initial.events}
            initialSession={resolved.initial.session}
            onClose={() => setIsOpen(false)}
          />
        ) : (
          <LoadingPanel onClose={() => setIsOpen(false)} />
        ))}

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

function PanelShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex h-[32rem] max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">ShopWise</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <X className="size-4" />
        </button>
      </header>
      {children}
    </div>
  );
}

function LoadingPanel({ onClose }: { onClose: () => void }) {
  return (
    <PanelShell onClose={onClose}>
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your conversation…</p>
      </div>
    </PanelShell>
  );
}

interface ChatPanelProps {
  storageKey: string;
  userId: string | undefined;
  initialEvents?: readonly HandleMessageStreamEvent[];
  initialSession?: SessionState;
  onClose: () => void;
}

function ChatPanel({ storageKey, userId, initialEvents, initialSession, onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const agent = useEveAgent({
    initialEvents,
    initialSession,
    onFinish(snapshot) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ events: snapshot.events, session: snapshot.session }),
        );
      }
      const { sessionId, continuationToken } = snapshot.session;
      if (userId && sessionId && continuationToken) {
        fetch("/api/chat-session", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, continuationToken }),
        }).catch(() => {
          // Best-effort — cross-device resume just won't have this turn yet.
        });
      }
    },
  });

  const isBusy = agent.status === "submitted" || agent.status === "streaming";

  // Smooth auto-scroll to the latest message, both on opening the widget and
  // as new messages/streamed text arrive.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [agent.data.messages]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isBusy) return;
    setInput("");
    void agent.send({ message });
  }

  return (
    <PanelShell onClose={onClose}>
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
            Something went wrong — please wait a moment and try again.
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
    </PanelShell>
  );
}
