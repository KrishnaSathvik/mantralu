import { useMantras } from "@/hooks/use-mantras";
import { useSettings } from "@/hooks/use-settings";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { favorites } = useSettings();
  const { data: mantras } = useMantras();
  const favMantras = mantras?.filter((m) => favorites.includes(m.id)) || [];

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <header className="page-header">
          <div className="page-header-inner">
            <h1 className="page-title">Favorites</h1>
          </div>
        </header>

        <main className="page-main">
          {favMantras.length > 0 ? (
            <StaggerContainer className="space-y-3">
              {favMantras.map((m) => (
                <StaggerItem key={m.id}>
                  <MantraCard mantra={m} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-20 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Heart className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display text-lg font-semibold text-foreground mb-1">No favorites yet</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tap the heart icon on any mantra to save it here for quick access
              </p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Favorites;
