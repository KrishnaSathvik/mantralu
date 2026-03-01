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
    const dayIndex = new Date().getDate() % mantras.length;
    return mantras[dayIndex];
  }, [mantras]);

  if (isLoading || !mantra) {
    return <Skeleton className="h-44 rounded-xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`/mantra/${mantra.slug}`}
        className="block rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-5 transition-shadow hover:shadow-lg hover:border-primary/40"
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Mantra of the Day
          </span>
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          {mantra.title_en}
        </h2>
        <p className="font-telugu text-lg text-muted-foreground mb-3">
          {mantra.title_te}
        </p>
        <p className="font-telugu text-base leading-relaxed text-foreground/80 line-clamp-2">
          {mantra.telugu_text.split("\n").slice(0, 2).join(" ")}
        </p>
        <p className="mt-3 text-sm font-medium text-primary">
          Read & Chant →
        </p>
      </Link>
    </motion.div>
  );
}
