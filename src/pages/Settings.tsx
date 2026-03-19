import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { MessageSquare, Trash2, ChevronRight, User, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserName, setUserName as saveUserName, getDeviceId } from "@/lib/device";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackSection, ReviewSection } from "@/components/FeedbackReview";
import { RashiPhalaluSection } from "@/components/RashiPhalaluSection";
import {
  loadSessions,
  saveSessions,
  deleteSession,
  setActiveSessionId,
  formatRelativeTime,
  type ChatSession,
} from "@/lib/chat-history";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0, 0, 0.2, 1] as const },
  }),
};

const Settings = () => {
  const { fontSize, setFontSize, darkMode, toggleDarkMode, language, setLanguage } = useSettings();
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [userName, setUserNameState] = useState(getUserName() || "");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const navigate = useNavigate();

  const handleOpenChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
    navigate("/chat");
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = deleteSession(sessions, sessionId);
    setSessions(updated);
    saveSessions(updated);
    toast.success("Chat deleted");
  };

  const handleClearAll = () => {
    setSessions([]);
    saveSessions([]);
    setActiveSessionId(null);
    toast.success("All chats cleared");
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    saveUserName(trimmed);
    setUserNameState(trimmed);
    setEditingName(false);
    try {
      await supabase.from("app_users").upsert(
        { device_id: getDeviceId(), name: trimmed },
        { onConflict: "device_id" }
      );
    } catch {}
    toast.success("Name updated");
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <header className="page-header">
          <div className="page-header-inner">
            <h1 className="page-title">Settings</h1>
          </div>
        </header>

        <main className="page-main space-y-5">
          {/* User Profile */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      autoFocus
                      maxLength={50}
                      className="flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveName} className="text-xs text-primary font-medium">
                      Save
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEditingName(false); setNameInput(userName); }} className="text-xs text-muted-foreground">
                      Cancel
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-foreground truncate">{userName || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">Tap to edit name</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingName(true)} className="ml-auto p-1.5 rounded-full hover:bg-secondary transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Font Size */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground mb-1">Font Size</h3>
            <p className="text-sm text-muted-foreground mb-4">Adjust text size for reading mantras</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">A</span>
              <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={16} max={36} step={1} className="flex-1" />
              <span className="text-lg font-bold text-muted-foreground">A</span>
              <span className="text-sm text-muted-foreground w-10 text-right tabular-nums">{fontSize}px</span>
            </div>
            <p className="font-telugu mt-3 text-muted-foreground text-center" style={{ fontSize: `${fontSize}px` }}>
              ఓం నమః శివాయ
            </p>
          </motion.div>

          {/* Dark Mode */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Easier reading in low light</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </motion.div>

          {/* Language */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground mb-1">Language Display</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose which text to show on mantra pages</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "both", label: "Both" },
                { value: "te", label: "Telugu" },
                { value: "en", label: "English" },
              ] as const).map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguage(opt.value)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all border ${
                    language === opt.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground border-border hover:border-primary/40 active:bg-secondary"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Chat History */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">Chat History</h3>
                <p className="text-sm text-muted-foreground">Your saved conversations</p>
              </div>
              {sessions.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearAll}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
                >
                  Clear All
                </motion.button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No chat history yet</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence>
                  {[...sessions].reverse().map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group flex items-center gap-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <button
                        onClick={() => handleOpenChat(session.id)}
                        className="flex-1 flex items-center gap-3 p-2.5 text-left min-w-0"
                      >
                        <MessageSquare className="h-4 w-4 text-primary/60 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground truncate">{session.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {session.messages.length} messages · {formatRelativeTime(session.updatedAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Rashi Phalalu - always accessible here */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <RashiPhalaluSection forceShow />
          </motion.div>

          {/* Feedback */}
          <FeedbackSection customIndex={6} />

          {/* Review */}
          <ReviewSection customIndex={6} />

          {/* About */}
          <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground mb-1">About మంత్రాలు</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sacred Telugu mantras for daily devotion. Browse Hindu mantras, prayers, and stotras in Telugu and English.
              Built with love for spiritual seekers.
            </p>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Settings;
