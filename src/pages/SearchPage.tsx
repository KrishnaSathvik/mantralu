import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useMantras } from "@/hooks/use-mantras";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const { data: mantras } = useMantras();

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const results = useMemo(() => {
    if (!query.trim() || !mantras) return [];
    const q = query.toLowerCase();
    return mantras.filter(
      (m) =>
        m.title_en.toLowerCase().includes(q) ||
        m.title_te.includes(query) ||
        m.telugu_text.includes(query) ||
        m.transliteration.toLowerCase().includes(q) ||
        m.deity?.name_en.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.includes(q))
    );
  }, [query, mantras]);

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
                placeholder="Search mantras..."
                autoFocus
                className="w-full rounded-xl border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </header>

        <main className="page-main">
          {query.trim() ? (
            results.length > 0 ? (
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
                <p className="text-muted-foreground">No results for "<span className="font-medium text-foreground">{query}</span>"</p>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground">Search for mantras, prayers, and stotras</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Type in Telugu or English</p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default SearchPage;
