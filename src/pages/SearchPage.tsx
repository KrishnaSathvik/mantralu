import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { mantras } from "@/data/sample-mantras";
import { MantraCard } from "@/components/MantraCard";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mantras.filter(
      (m) =>
        m.title_en.toLowerCase().includes(q) ||
        m.title_te.includes(query) ||
        m.text_te.includes(query) ||
        m.transliteration.toLowerCase().includes(q) ||
        m.deity.toLowerCase().includes(q) ||
        m.tags.some((t) => t.includes(q))
    );
  }, [query]);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

      <main className="mx-auto max-w-lg px-4 py-5 space-y-2.5">
        {query.trim() ? (
          results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">{results.length} result{results.length !== 1 ? "s" : ""}</p>
              {results.map((m) => (
                <MantraCard key={m.id} mantra={m} />
              ))}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No results for "{query}"
            </p>
          )
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Search for mantras, prayers, and stotras</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
