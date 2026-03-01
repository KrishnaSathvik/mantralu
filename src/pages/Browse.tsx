import { useSearchParams, Link } from "react-router-dom";
import { MantraCard } from "@/components/MantraCard";
import { mantras, categories, deities } from "@/data/sample-mantras";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDeity, setSelectedDeity] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    mantras.forEach((m) => m.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, []);

  const filtered = useMemo(() => {
    return mantras.filter((m) => {
      if (selectedCategory && m.category !== selectedCategory) return false;
      if (selectedDeity && m.deity !== selectedDeity) return false;
      if (selectedTag && !m.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [selectedCategory, selectedDeity, selectedTag]);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Browse</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-5">
        {/* Category filter */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                !selectedCategory ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(selectedCategory === c.slug ? "" : c.slug)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  selectedCategory === c.slug ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
                )}
              >
                {c.icon} {c.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Deity filter */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Deity</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDeity("")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                !selectedDeity ? "bg-accent text-accent-foreground border-accent" : "bg-card text-foreground border-border hover:border-accent/40"
              )}
            >
              All
            </button>
            {deities.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDeity(selectedDeity === d.name_en ? "" : d.name_en)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  selectedDeity === d.name_en ? "bg-accent text-accent-foreground border-accent" : "bg-card text-foreground border-border hover:border-accent/40"
                )}
              >
                {d.icon} {d.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filter */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  selectedTag === tag ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card text-foreground border-border hover:border-secondary/40"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((m) => <MantraCard key={m.id} mantra={m} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">No mantras found for these filters.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Browse;
