import { DailyMantra } from "@/components/DailyMantra";
import { CategoryGrid } from "@/components/CategoryGrid";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { useMantras } from "@/hooks/use-mantras";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: mantras, isLoading } = useMantras();

  const topMantras = mantras?.slice(0, 10);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3 safe-area-top safe-area-x">
          <div className="mx-auto max-w-lg">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Mantra<span className="text-primary">Vani</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Sacred Prayers & Mantras</p>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-5 space-y-6 safe-area-x">
          <DailyMantra />

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Categories</h2>
            <CategoryGrid />
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Top Mantras</h2>
            {isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <StaggerContainer className="space-y-2.5">
                {topMantras?.map((m) => (
                  <StaggerItem key={m.id}>
                    <MantraCard mantra={m} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

export default Index;
