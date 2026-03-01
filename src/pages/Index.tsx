import { DailyMantra } from "@/components/DailyMantra";
import { SearchBar } from "@/components/SearchBar";
import { CategoryGrid } from "@/components/CategoryGrid";
import { MantraCard } from "@/components/MantraCard";
import { mantras } from "@/data/sample-mantras";
import { useSettings } from "@/hooks/use-settings";

const Index = () => {
  const { recentlyViewed } = useSettings();
  const recentMantras = recentlyViewed
    .map((id) => mantras.find((m) => m.id === id))
    .filter(Boolean) as typeof mantras;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mantra<span className="text-primary">Vani</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Sacred Prayers & Mantras</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-6">
        <SearchBar />
        <DailyMantra />

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Categories
          </h2>
          <CategoryGrid />
        </section>

        {recentMantras.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">
              Recently Viewed
            </h2>
            <div className="space-y-2.5">
              {recentMantras.slice(0, 3).map((m) => (
                <MantraCard key={m.id} mantra={m} compact />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            All Mantras
          </h2>
          <div className="space-y-2.5">
            {mantras.map((m) => (
              <MantraCard key={m.id} mantra={m} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
