import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId, getUserName, setUserName, hasCompletedOnboarding } from "@/lib/device";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!hasCompletedOnboarding() && !isAdminRoute) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
    if (isAdminRoute) setOpen(false);
  }, [isAdminRoute]);

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

      setOpen(false);
      toast.success(`నమస్కారం ${trimmed}! 🙏`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl bg-card border shadow-2xl p-6"
          >
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-3">
                🙏
              </div>
              <h2 className="font-display text-xl text-foreground">మంత్రాలు కి స్వాగతం!</h2>
              <p className="text-sm text-muted-foreground mt-1">Welcome to Mantras</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Enter your name"
                  autoFocus
                  maxLength={50}
                  className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!name.trim() || loading}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50 transition-opacity"
              >
                {loading ? "..." : "Continue 🙏"}
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("mv-onboarding-skipped", "true");
                  setOpen(false);
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
