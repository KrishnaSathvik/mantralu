import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/use-mantras";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/components/DynamicIcon";

const categoryThemes: Record<string, { gradient: string; iconBg: string; glow: string }> = {
  daily: {
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    glow: "bg-amber-200/40 dark:bg-amber-700/20",
  },
  deity: {
    gradient: "from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    glow: "bg-rose-200/40 dark:bg-rose-700/20",
  },
  stotras: {
    gradient: "from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    glow: "bg-violet-200/40 dark:bg-violet-700/20",
  },
  aartis: {
    gradient: "from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/30",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    glow: "bg-orange-200/40 dark:bg-orange-700/20",
  },
  healing: {
    gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    glow: "bg-emerald-200/40 dark:bg-emerald-700/20",
  },
  prosperity: {
    gradient: "from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/30",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
    glow: "bg-yellow-200/40 dark:bg-yellow-700/20",
  },
};

const defaultTheme = {
  gradient: "from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20",
  iconBg: "bg-primary/10",
  glow: "bg-primary/10",
};

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {categories?.map((cat, i) => {
        const theme = categoryThemes[cat.slug] || defaultTheme;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: [0, 0, 0.2, 1] }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={`/browse?category=${cat.slug}`}
              className={`relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border p-3 sm:p-4 transition-all active:scale-[0.97] hover:shadow-lg hover:border-primary/30 overflow-hidden bg-gradient-to-br ${theme.gradient}`}
            >
              {/* Decorative glow */}
              <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl pointer-events-none ${theme.glow}`} />
              
              <div className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full ${theme.iconBg}`}>
                <DynamicIcon name={cat.icon} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-center text-foreground leading-tight">
                {cat.name_en}
              </span>
              <span className="font-telugu text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
                {cat.name_te}
              </span>
              {cat.mantra_count > 0 && (
                <span className="text-[10px] tabular-nums font-semibold text-primary/80">
                  {cat.mantra_count}
                </span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
