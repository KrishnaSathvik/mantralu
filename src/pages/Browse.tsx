import { useSearchParams, Link } from "react-router-dom";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { useMantras, useCategories, useDeities } from "@/hooks/use-mantras";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, Filter, X, SlidersHorizontal } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Skeleton } from "@/components/ui/skeleton";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDeity, setSelectedDeity] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const { data: mantras, isLoading: mantrasLoading } = useMantras();
  const { data: categories } = useCategories();
  const { data: deities } = useDeities();

  const activeCategory = categories?.find((c) => c.slug === selectedCategory);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    mantras?.forEach((m) => m.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [mantras]);

  const activeFilterCount = [selectedCategory, selectedDeity, selectedTag].filter(Boolean).length;

  const filtered = useMemo(() => {
    return (mantras || []).filter((m) => {
      if (selectedCategory && m.category?.slug !== selectedCategory) return false;
      if (selectedDeity && m.deity?.name_en !== selectedDeity) return false;
      if (selectedTag && !m.tags?.includes(selectedTag)) return false;
      return true;
    });
  }, [mantras, selectedCategory, selectedDeity, selectedTag]);

  const clearAll = () => {
    setSelectedCategory("");
    setSelectedDeity("");
    setSelectedTag("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md safe-area-top safe-area-x">
          <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-display text-xl sm:text-2xl text-foreground">
                  {activeCategory ? activeCategory.name_en : "Browse"}
                </h1>
                {activeCategory && (
                  <p className="font-telugu text-xs text-muted-foreground">
                    {activeCategory.name_te}
                  </p>
                )}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                showFilters
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && !showFilters && (
            <div className="mx-auto max-w-lg px-4 pb-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {selectedCategory && (
                <ActivePill
                  label={categories?.find((c) => c.slug === selectedCategory)?.name_en || selectedCategory}
                  onRemove={() => setSelectedCategory("")}
                />
              )}
              {selectedDeity && (
                <ActivePill label={selectedDeity} onRemove={() => setSelectedDeity("")} />
              )}
              {selectedTag && (
                <ActivePill label={`#${selectedTag}`} onRemove={() => setSelectedTag("")} />
              )}
              <button
                onClick={clearAll}
                className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-lg px-4 py-5 space-y-5 safe-area-x">
          {/* Collapsible Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border bg-card p-4 space-y-4">
                  {/* Categories */}
                  <FilterSection title="Category">
                    <FilterChip
                      active={!selectedCategory}
                      onClick={() => setSelectedCategory("")}
                    >
                      All
                    </FilterChip>
                    {categories?.map((c) => (
                      <FilterChip
                        key={c.id}
                        active={selectedCategory === c.slug}
                        onClick={() => setSelectedCategory(selectedCategory === c.slug ? "" : c.slug)}
                        icon={<DynamicIcon name={c.icon} className="h-3.5 w-3.5" />}
                        count={c.mantra_count}
                      >
                        {c.name_en}
                      </FilterChip>
                    ))}
                  </FilterSection>

                  {/* Deities */}
                  <FilterSection title="Deity">
                    <FilterChip
                      active={!selectedDeity}
                      onClick={() => setSelectedDeity("")}
                    >
                      All
                    </FilterChip>
                    {deities?.map((d) => (
                      <FilterChip
                        key={d.id}
                        active={selectedDeity === d.name_en}
                        onClick={() => setSelectedDeity(selectedDeity === d.name_en ? "" : d.name_en)}
                        icon={<DynamicIcon name={d.icon} className="h-3.5 w-3.5" />}
                      >
                        {d.name_en}
                      </FilterChip>
                    ))}
                  </FilterSection>

                  {/* Tags */}
                  {allTags.length > 0 && (
                    <FilterSection title="Tags">
                      {allTags.map((tag) => (
                        <FilterChip
                          key={tag}
                          active={selectedTag === tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                        >
                          #{tag}
                        </FilterChip>
                      ))}
                    </FilterSection>
                  )}

                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAll}
                      className="w-full text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-1"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "mantra" : "mantras"} found
            </p>
          </div>

          {/* Results */}
          {mantrasLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <StaggerContainer className="space-y-3">
              {filtered.map((m) => (
                <StaggerItem key={m.id}>
                  <MantraCard mantra={m} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Filter className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display text-xl text-foreground mb-1">
                No mantras found
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
              <button
                onClick={clearAll}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
      )}
    >
      {icon}
      {children}
      {count !== undefined && count > 0 && (
        <span className={cn(
          "text-[10px] tabular-nums",
          active ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1 shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
    >
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
        <X className="h-3 w-3" />
      </button>
    </motion.span>
  );
}

export default Browse;
