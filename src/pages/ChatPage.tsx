import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string; timestamp: number };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spiritual-chat`;
const STORAGE_KEY = "mv-chat-history";

const STARTER_PROMPTS = [
  { emoji: "🙏", text: "What mantra helps with inner peace?" },
  { emoji: "🕉️", text: "Tell me about Hanuman Chalisa" },
  { emoji: "📿", text: "Which mantra should I chant daily?" },
  { emoji: "✨", text: "Explain the meaning of Om Namah Shivaya" },
  { emoji: "🪷", text: "గణపతి మంత్రం గురించి చెప్పండి" },
  { emoji: "🎯", text: "Best mantra for success in exams?" },
];

function loadHistory(): Msg[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(msgs: Msg[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat cleared");
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { role: "user", content: trimmed, timestamp: Date.now() };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput("");
    setIsLoading(true);

    // Resize textarea back
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

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const content = assistantSoFar;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.timestamp === 0) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content, timestamp: 0 }];
        });
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

      // Finalize timestamp
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 && m.timestamp === 0 ? { ...m, timestamp: Date.now() } : m))
      );
    } catch (e: any) {
      console.error("Chat error:", e);
      toast.error(e.message || "Failed to get response");
      // Remove the user message if no response came
      if (!assistantSoFar) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
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
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="page-header">
          <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link to="/" className="page-back-btn">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-base shrink-0">
                  🕉️
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-lg text-foreground truncate">మంత్రాలు Guide</h1>
                  <p className="text-[10px] text-muted-foreground leading-none">Spiritual AI Assistant</p>
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="rounded-full p-2.5 hover:bg-secondary transition-colors"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )}
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="mx-auto max-w-lg px-4 py-4 safe-area-x space-y-3">
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
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border rounded-bl-md"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-foreground">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.timestamp > 0 && (
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="fixed bottom-[calc(3.5rem+max(0.5rem,var(--safe-area-bottom)))] left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md">
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
