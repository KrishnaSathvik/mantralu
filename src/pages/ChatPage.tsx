import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import {
  Msg,
  loadSessions,
  saveSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  updateSession,
} from "@/lib/chat-history";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spiritual-chat`;

const STARTER_PROMPTS = [
  { emoji: "🙏", text: "What mantra helps with inner peace?" },
  { emoji: "🕉️", text: "Tell me about Hanuman Chalisa" },
  { emoji: "📿", text: "Which mantra should I chant daily?" },
  { emoji: "✨", text: "Explain the meaning of Om Namah Shivaya" },
  { emoji: "🪷", text: "గణపతి మంత్రం గురించి చెప్పండి" },
  { emoji: "🎯", text: "Best mantra for success in exams?" },
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ChatPage = () => {
  const [sessions, setSessions] = useState(loadSessions);
  const [activeId, setActiveId] = useState<string | null>(() => getActiveSessionId());
  const activeSession = sessions.find((s) => s.id === activeId);
  const messages = activeSession?.messages ?? [];

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingContentRef = useRef("");

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior,
        });
      }
    });
  }, []);

  const hasScrolledOnMount = useRef(false);

  useEffect(() => {
    if (!hasScrolledOnMount.current) {
      hasScrolledOnMount.current = true;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
      }
      return;
    }
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Persist sessions
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    setActiveSessionId(activeId);
  }, [activeId]);

  const setMessages = (updater: Msg[] | ((prev: Msg[]) => Msg[])) => {
    setSessions((prevSessions) => {
      if (!activeId) return prevSessions;
      const session = prevSessions.find((s) => s.id === activeId);
      const currentMsgs = session?.messages ?? [];
      const newMsgs = typeof updater === "function" ? updater(currentMsgs) : updater;
      return updateSession(prevSessions, activeId, newMsgs);
    });
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions((prev) => [...prev, newSession]);
    setActiveId(newSession.id);
    hasScrolledOnMount.current = false;
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Auto-create session if none active
    let currentId = activeId;
    if (!currentId) {
      const newSession = createNewSession();
      setSessions((prev) => [...prev, newSession]);
      setActiveId(newSession.id);
      currentId = newSession.id;
    }

    const userMsg: Msg = { role: "user", content: trimmed, timestamp: Date.now() };
    
    // Get current messages for this session
    const currentSession = sessions.find((s) => s.id === currentId);
    const currentMsgs = currentSession?.messages ?? [];
    const updatedMsgs = [...currentMsgs, userMsg];
    
    setSessions((prev) => updateSession(prev, currentId!, updatedMsgs));
    setInput("");
    setIsLoading(true);
    setIsStreaming(false);

    if (inputRef.current) inputRef.current.style.height = "auto";

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const flushContent = () => {
        setStreamingContent(pendingContentRef.current);
        scrollToBottom();
        rafRef.current = null;
      };

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        pendingContentRef.current = assistantSoFar;
        if (!isStreaming) setIsStreaming(true);
        // Throttle UI updates to animation frames for smooth streaming
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushContent);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush — commit streaming content to session storage
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setStreamingContent("");
      pendingContentRef.current = "";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.timestamp === 0) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar, timestamp: Date.now() } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar, timestamp: Date.now() }];
      });
    } catch (e: any) {
      console.error("Chat error:", e);
      toast.error(e.message || "Failed to get response");
      if (!assistantSoFar) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleTextareaInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  const showStarters = messages.length === 0;

  return (
    <PageTransition>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="page-header shrink-0">
          <div className="page-header-inner justify-between">
            <h1 className="page-title">మంత్రాలు Guide</h1>
            {messages.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleNewChat}
                className="rounded-full p-2.5 hover:bg-secondary transition-colors"
                title="New Chat"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )}
          </div>
        </header>

        {/* Messages area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-none">
          <div className="mx-auto max-w-lg px-4 pt-4 pb-4 safe-area-x">
            {showStarters ? (
              <div className="flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-4">
                  🙏
                </div>
                <h2 className="font-display text-xl text-foreground mb-1">నమస్కారం!</h2>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
                  Ask me about mantras, their meanings, spiritual practices, or anything devotional
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {STARTER_PROMPTS.map((s) => (
                    <motion.button
                      key={s.text}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => send(s.text)}
                      className="text-left rounded-xl border bg-card p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-base mb-1 block">{s.emoji}</span>
                      <span className="text-xs text-foreground/80 leading-snug line-clamp-2">{s.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={`${i}-${msg.timestamp}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0 mt-1 mr-2">
                        🕉️
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl text-[13.5px] leading-[1.7]",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground px-4 py-2.5 rounded-br-md max-w-[80%]"
                          : "bg-card border px-4 py-3 rounded-bl-md max-w-[88%]"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="chat-markdown">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.timestamp > 0 && (
                        <p
                          className={cn(
                            "text-[10px] mt-1.5 select-none",
                            msg.role === "user"
                              ? "text-primary-foreground/50 text-right"
                              : "text-muted-foreground/60"
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Live streaming bubble */}
                {isStreaming && streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex justify-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0 mt-1 mr-2">
                      🕉️
                    </div>
                    <div className="bg-card border px-4 py-3 rounded-2xl rounded-bl-md max-w-[88%] text-[13.5px] leading-[1.7]">
                      <div className="chat-markdown streaming">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {isLoading && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0 mt-1 mr-2">
                      🕉️
                    </div>
                    <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t bg-background/95 backdrop-blur-md pb-[calc(3.5rem+max(0.5rem,var(--safe-area-bottom)))]">
          <div className="mx-auto max-w-lg px-3 py-2.5 safe-area-x flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about mantras..."
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-card px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all max-h-[120px]"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              className={cn(
                "shrink-0 rounded-xl p-2.5 transition-colors",
                input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChatPage;
