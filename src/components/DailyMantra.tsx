import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMantras } from "@/hooks/use-mantras";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

export function DailyMantra() {
  const { data: mantras, isLoading } = useMantras();

  const mantra = useMemo(() => {
    if (!mantras?.length) return null;
    // Use day of year for better distribution
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return mantras[dayOfYear % mantras.length];
  }, [mantras]);

  if (isLoading || !mantra) {
    return <Skeleton className="h-44 rounded-2xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
    >
      <Link
        to={`/mantra/${mantra.slug}`}
        className="block rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-5 transition-all active:scale-[0.99] hover:shadow-lg hover:border-primary/40 relative overflow-hidden"
      >
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary">
            Mantra of the Day
          </span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl text-foreground mb-1 leading-snug">
          {mantra.title_en}
        </h2>
        <p className="font-telugu text-base sm:text-lg text-muted-foreground mb-3">
          {mantra.title_te}
        </p>
        <p className="font-telugu text-sm sm:text-base leading-relaxed text-foreground/80 line-clamp-2">
          {mantra.telugu_text.split("\n").slice(0, 2).join(" ")}
        </p>
        <p className="mt-3 text-sm font-medium text-primary">
          Read & Chant →
        </p>
      </Link>
    </motion.div>
  );
}
