import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/use-mantras";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/components/DynamicIcon";

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {categories?.map((cat, i) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: [0, 0, 0.2, 1] }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={`/browse?category=${cat.slug}`}
            className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border bg-card p-3 sm:p-4 transition-all active:bg-card/80 hover:shadow-md hover:border-primary/30"
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/8">
              <DynamicIcon name={cat.icon} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-center text-foreground leading-tight">
              {cat.name_en}
            </span>
            <span className="font-telugu text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
              {cat.name_te}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
