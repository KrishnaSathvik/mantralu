import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useMantras } from "@/hooks/use-mantras";
import { useSettings } from "@/hooks/use-settings";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Search, ArrowLeft, Clock, TrendingUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { scoreMantra } from "@/lib/fuzzy-search";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = [
  "Ganesha", "Hanuman", "Vishnu", "Shiva", "Lakshmi",
  "Durga", "Rama", "Krishna", "Saraswati",
  "చాలీసా", "స్తోత్రం", "అష్టోత్తరం",
];

const RECENT_SEARCHES_KEY = "mv-recent-searches";

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q);
  const updated = [q, ...recent].slice(0, 8);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const { data: mantras } = useMantras();
  const { recentlyViewed } = useSettings();
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Save search after a pause
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }, 1500);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim() || !mantras) return [];
    return mantras
      .map((m) => ({ mantra: m, score: scoreMantra(m, query.trim()) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.mantra);
  }, [query, mantras]);

  const recentMantras = useMemo(() => {
    if (!mantras || recentlyViewed.length === 0) return [];
    return recentlyViewed
      .slice(0, 4)
      .map((id) => mantras.find((m) => m.id === id))
      .filter(Boolean);
  }, [mantras, recentlyViewed]);

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const showSuggestions = !query.trim();

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <header className="page-header">
          <div className="page-header-inner">
            <Link to="/" className="page-back-btn">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mantras in Telugu or English..."
                autoFocus
                className="w-full rounded-xl border bg-card pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="page-main">
          {showSuggestions ? (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-primary font-medium"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="rounded-full border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Popular Searches */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.section>

              {/* Recently Viewed */}
              {recentMantras.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-2.5">Recently Viewed</h3>
                  <div className="space-y-2.5">
                    {recentMantras.map((m) => m && (
                      <MantraCard key={m.id} mantra={m} />
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="font-semibold text-foreground">{results.length}</span> result{results.length !== 1 ? "s" : ""}
              </p>
              <StaggerContainer className="space-y-3">
                {results.map((m) => (
                  <StaggerItem key={m.id}>
                    <MantraCard mantra={m} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          ) : (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground">
                No results for "<span className="font-medium text-foreground">{query}</span>"
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different spelling or search in Telugu</p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default SearchPage;
