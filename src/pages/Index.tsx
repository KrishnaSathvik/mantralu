import { DailyMantra } from "@/components/DailyMantra";
import { CategoryGrid } from "@/components/CategoryGrid";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { useMantras } from "@/hooks/use-mantras";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const { data: mantras, isLoading } = useMantras();
  const topMantras = mantras?.slice(0, 10);

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md safe-area-top safe-area-x">
          <div className="mx-auto max-w-lg px-4 py-3">
            <h1 className="font-display text-[26px] sm:text-3xl text-foreground">
              మంత్రా<span className="text-primary">లు</span>
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide font-heading italic">Sacred Telugu Mantras for Daily Devotion</p>
          </div>
        </header>

        <main className="page-main space-y-7 pb-4">
          {/* Daily Mantra */}
          <DailyMantra />

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl sm:text-2xl text-foreground">Categories</h2>
              <Link to="/browse" className="text-xs font-medium text-primary flex items-center gap-0.5 hover:underline">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CategoryGrid />
          </section>

          {/* Top Mantras */}
          <section>
            <h2 className="font-display text-xl sm:text-2xl text-foreground mb-3">Top Mantras</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[88px] rounded-xl" />
                ))}
              </div>
            ) : (
              <StaggerContainer className="space-y-3">
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
