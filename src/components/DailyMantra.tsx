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
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return mantras[dayOfYear % mantras.length];
  }, [mantras]);

  if (isLoading || !mantra) {
    return <Skeleton className="h-52 rounded-2xl" />;
  }

  // Take first 2 lines of Telugu text for preview
  const previewLines = mantra.telugu_text.split("\n").slice(0, 2).join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
    >
      <Link
        to={`/mantra/${mantra.slug}`}
        className="group block relative rounded-2xl overflow-hidden transition-all active:scale-[0.99] hover:shadow-xl"
      >
        {/* Background with warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-accent/80 dark:from-primary/80 dark:via-primary/70 dark:to-accent/60" />
        
        {/* Decorative mandala-like pattern */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.08]"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, currentColor 31%, currentColor 32%, transparent 33%, transparent 48%, currentColor 49%, currentColor 50%, transparent 51%, transparent 65%, currentColor 66%, currentColor 67%, transparent 68%)`,
            color: 'white',
          }}
        />
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-[0.06]"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, currentColor 31%, currentColor 32%, transparent 33%, transparent 55%, currentColor 56%, currentColor 57%, transparent 58%)`,
            color: 'white',
          }}
        />

        {/* Content */}
        <div className="relative px-5 py-6 sm:px-6 sm:py-7">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-4 w-4 text-primary-foreground/90" />
            </motion.div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              Mantra of the Day
            </span>
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl sm:text-3xl text-primary-foreground mb-1 leading-tight">
            {mantra.title_en}
          </h2>
          <p className="font-telugu text-lg sm:text-xl text-primary-foreground/70 mb-5">
            {mantra.title_te}
          </p>

          {/* Telugu preview quote */}
          <div className="rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3.5 mb-4">
            <p className="font-telugu text-[15px] sm:text-base leading-[2] text-primary-foreground/90 whitespace-pre-line text-center">
              {previewLines}
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-foreground/90 group-hover:text-primary-foreground transition-colors">
              Read & Chant →
            </span>
            {mantra.chant_count && (
              <span className="text-xs text-primary-foreground/60 tabular-nums">
                {mantra.chant_count}× chants
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
