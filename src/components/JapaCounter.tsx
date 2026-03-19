import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface JapaCounterProps {
  open: boolean;
  onClose: () => void;
  mantraTitle: string;
  recommendedCount?: number | null;
}

const PRESETS = [108, 1008];

export function JapaCounter({ open, onClose, mantraTitle, recommendedCount }: JapaCounterProps) {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(recommendedCount || 108);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Screen wake lock
  useEffect(() => {
    if (!open) return;
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) {
          lock = await navigator.wakeLock.request("screen");
          wakeLockRef.current = lock;
        }
      } catch { /* silent */ }
    };
    acquire();
    return () => {
      lock?.release();
      wakeLockRef.current = null;
    };
  }, [open]);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, [hapticEnabled]);

  const reset = () => setCount(0);
  const progress = Math.min(count / target, 1);
  const completed = count >= target;

  if (!open) return null;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      <motion.div
        key="japa-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-between safe-area-inset"
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between px-4 py-3">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{mantraTitle}</p>
          <button onClick={() => setHapticEnabled(!hapticEnabled)} className="rounded-full p-2 hover:bg-secondary transition-colors">
            {hapticEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Target presets */}
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setTarget(p); setCount(0); }}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                target === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}
            >
              {p}×
            </button>
          ))}
          {recommendedCount && !PRESETS.includes(recommendedCount) && (
            <button
              onClick={() => { setTarget(recommendedCount); setCount(0); }}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                target === recommendedCount ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}
            >
              {recommendedCount}×
            </button>
          )}
        </div>

        {/* Mala ring + tap area */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={increment}
          className="relative flex items-center justify-center w-72 h-72 rounded-full select-none focus:outline-none active:outline-none"
          aria-label="Tap to count"
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="120" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity={0.3} />
            <motion.circle
              cx="128" cy="128" r="120"
              fill="none"
              stroke={completed ? "hsl(var(--primary))" : "hsl(var(--primary))"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.15 }}
            />
          </svg>

          {/* Mala beads */}
          {Array.from({ length: 27 }).map((_, i) => {
            const angle = (i / 27) * 2 * Math.PI - Math.PI / 2;
            const r = 120;
            const cx = 128 + r * Math.cos(angle);
            const cy = 128 + r * Math.sin(angle);
            const filled = i / 27 <= progress;
            return (
              <svg key={i} className="absolute inset-0 w-full h-full" viewBox="0 0 256 256" style={{ pointerEvents: "none" }}>
                <circle cx={cx} cy={cy} r={filled ? 5 : 3.5} fill={filled ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)"} />
              </svg>
            );
          })}

          {/* Count display */}
          <div className="flex flex-col items-center z-10">
            <motion.span
              key={count}
              initial={{ scale: 1.15, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("font-display text-6xl font-bold", completed ? "text-primary" : "text-foreground")}
            >
              {count}
            </motion.span>
            <span className="text-xs text-muted-foreground mt-1">/ {target}</span>
          </div>
        </motion.button>

        {/* Completed message */}
        <AnimatePresence>
          {completed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary text-sm font-medium"
            >
              🎉 జపం పూర్తయింది! Japa Complete!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="w-full px-6 pb-6 flex items-center justify-center gap-4">
          <button onClick={reset} className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button onClick={onClose} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            Done
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
