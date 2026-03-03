import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId, getUserName, setUserName } from "@/lib/device";
import { toast } from "sonner";

interface NamePromptProps {
  onComplete: (name: string) => void;
  message?: string;
}

export function NamePrompt({ onComplete, message = "What should we call you?" }: NamePromptProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    setLoading(true);

    try {
      const deviceId = getDeviceId();
      setUserName(trimmed);

      await supabase.from("app_users").upsert(
        { device_id: deviceId, name: trimmed },
        { onConflict: "device_id" }
      );

      toast.success(`నమస్కారం ${trimmed}! 🙏`);
      onComplete(trimmed);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4 space-y-2.5"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🙏</span>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter your name"
          autoFocus
          maxLength={50}
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {loading ? "..." : "Go"}
        </motion.button>
      </div>
    </motion.div>
  );
}
