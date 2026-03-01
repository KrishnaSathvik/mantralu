import { useSearchParams, Link } from "react-router-dom";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { useMantras, useCategories, useDeities } from "@/hooks/use-mantras";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDeity, setSelectedDeity] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const { data: mantras, isLoading: mantrasLoading } = useMantras();
  const { data: categories } = useCategories();
  const { data: deities } = useDeities();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    mantras?.forEach((m) => m.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [mantras]);

  const filtered = useMemo(() => {
    return (mantras || []).filter((m) => {
      if (selectedCategory && m.category?.slug !== selectedCategory) return false;
      if (selectedDeity && m.deity?.name_en !== selectedDeity) return false;
      if (selectedTag && !m.tags?.includes(selectedTag)) return false;
      return true;
    });
  }, [mantras, selectedCategory, selectedDeity, selectedTag]);

  const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
        active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"
      )}
    >
      {children}
    </motion.button>
  );

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3 safe-area-top safe-area-x">
          <div className="mx-auto max-w-lg flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Browse</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-5 space-y-5 safe-area-x">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={!selectedCategory} onClick={() => setSelectedCategory("")}>All</FilterChip>
              {categories?.map((c) => (
                <FilterChip key={c.id} active={selectedCategory === c.slug} onClick={() => setSelectedCategory(selectedCategory === c.slug ? "" : c.slug)}>
                  {c.icon} {c.name_en}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Deity</h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={!selectedDeity} onClick={() => setSelectedDeity("")}>All</FilterChip>
              {deities?.map((d) => (
                <FilterChip key={d.id} active={selectedDeity === d.name_en} onClick={() => setSelectedDeity(selectedDeity === d.name_en ? "" : d.name_en)}>
                  {d.icon} {d.name_en}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <FilterChip key={tag} active={selectedTag === tag} onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}>
                  #{tag}
                </FilterChip>
              ))}
            </div>
          </div>

          {mantrasLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="space-y-2.5">
              {filtered.length > 0 ? (
                filtered.map((m) => (
                  <StaggerItem key={m.id}>
                    <MantraCard mantra={m} />
                  </StaggerItem>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No mantras found for these filters.</p>
              )}
            </StaggerContainer>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Browse;
