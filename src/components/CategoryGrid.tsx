import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/use-mantras";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories?.map((cat, i) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: [0, 0, 0.2, 1] }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={`/browse?category=${cat.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md hover:border-primary/30"
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-xs font-medium text-center text-foreground leading-tight">
              {cat.name_en}
            </span>
            <span className="font-telugu text-xs text-muted-foreground text-center leading-tight">
              {cat.name_te}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
