import { useMantras } from "@/hooks/use-mantras";
import { useSettings } from "@/hooks/use-settings";
import { MantraCard } from "@/components/MantraCard";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Favorites = () => {
  const { favorites } = useSettings();
  const { data: mantras } = useMantras();
  const favMantras = mantras?.filter((m) => favorites.includes(m.id)) || [];

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3 safe-area-top safe-area-x">
          <div className="mx-auto max-w-lg flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Favorites</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-5 safe-area-x">
          {favMantras.length > 0 ? (
            <StaggerContainer className="space-y-2.5">
              {favMantras.map((m) => (
                <StaggerItem key={m.id}>
                  <MantraCard mantra={m} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Tap the heart icon on any mantra to save it here</p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Favorites;
