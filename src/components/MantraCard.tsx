import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import type { DbMantra } from "@/hooks/use-mantras";

interface MantraCardProps {
  mantra: DbMantra;
  compact?: boolean;
}

export function MantraCard({ mantra, compact }: MantraCardProps) {
  const { favorites, toggleFavorite } = useSettings();
  const isFav = favorites.includes(mantra.id);

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
        to={`/mantra/${mantra.slug}`}
        className="group block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md hover:border-primary/30"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {mantra.title_en}
            </h3>
            {!compact && (
              <p className="font-telugu text-base text-muted-foreground mt-0.5 truncate">
                {mantra.title_te}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mantra.deity && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {mantra.deity.icon} {mantra.deity.name_en}
                </span>
              )}
              {mantra.category && (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {mantra.category.icon} {mantra.category.name_en}
                </span>
              )}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(mantra.id);
            }}
            className="mt-1 shrink-0 rounded-full p-1.5 transition-colors hover:bg-primary/10"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isFav ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}
