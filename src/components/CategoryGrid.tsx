import { Link } from "react-router-dom";
import { categories } from "@/data/sample-mantras";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/browse?category=${cat.slug}`}
          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.02]"
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="text-xs font-medium text-center text-foreground leading-tight">
            {cat.name_en}
          </span>
          <span className="font-telugu text-xs text-muted-foreground text-center leading-tight">
            {cat.name_te}
          </span>
        </Link>
      ))}
    </div>
  );
}
