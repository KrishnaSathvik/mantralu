import { useParams, Link } from "react-router-dom";
import { useMantraBySlug } from "@/hooks/use-mantras";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Share2, Copy, Check } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  }),
};

const MantraDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: mantra, isLoading } = useMantraBySlug(slug);
  const { fontSize, setFontSize, addRecentlyViewed, favorites, toggleFavorite } = useSettings();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"telugu" | "english">("telugu");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (mantra) addRecentlyViewed(mantra.id);
  }, [mantra?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <header className="page-header">
          <div className="page-header-inner">
            <Link to="/" className="page-back-btn"><ArrowLeft className="h-5 w-5" /></Link>
            <Skeleton className="h-6 w-40" />
          </div>
        </header>
        <main className="page-main space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </main>
      </div>
    );
  }

  if (!mantra) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center px-6">
          <p className="text-muted-foreground text-lg">Mantra not found.</p>
          <Link to="/" className="text-primary mt-3 inline-block font-medium">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(mantra.id);
  const benefitsEn = Array.isArray(mantra.benefits) ? mantra.benefits : [];
  const benefitsTe = Array.isArray((mantra as any).benefits_te) ? (mantra as any).benefits_te : [];
  const whenToChantTe = (mantra as any).when_to_chant_te as string | null;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: mantra.title_en,
        text: `${mantra.title_en} — ${mantra.transliteration}`,
        url: window.location.href,
      });
    } catch {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const text = `${mantra.title_en}\n${mantra.title_te}\n\n${mantra.telugu_text}\n\n${mantra.transliteration}\n\n${mantra.meaning_en}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="page-header">
          <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link to="/" className="page-back-btn">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-display text-base sm:text-lg font-bold text-foreground truncate">{mantra.title_en}</h1>
            </div>
            <div className="flex items-center gap-0 shrink-0">
              <motion.button whileTap={{ scale: 0.85 }} onClick={handleShare} className="rounded-full p-2.5 hover:bg-secondary active:bg-secondary transition-colors">
                <Share2 className="h-[18px] w-[18px] text-muted-foreground" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopy} className="rounded-full p-2.5 hover:bg-secondary active:bg-secondary transition-colors">
                {copied ? <Check className="h-[18px] w-[18px] text-primary" /> : <Copy className="h-[18px] w-[18px] text-muted-foreground" />}
              </motion.button>
              <motion.button whileTap={{ scale: 1.3 }} onClick={() => toggleFavorite(mantra.id)} className="rounded-full p-2.5 hover:bg-secondary active:bg-secondary transition-colors">
                <Heart className={cn("h-[18px] w-[18px]", isFav ? "fill-primary text-primary" : "text-muted-foreground")} />
              </motion.button>
            </div>
          </div>
        </header>

        <main className="page-main space-y-5 pb-4">
          {/* Hero Section */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}
            className="rounded-2xl border bg-card p-4 sm:p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04]" style={{
              background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
            }} />
            
            <div className="flex items-start gap-3 mb-3">
              {mantra.deity && (
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <DynamicIcon name={mantra.deity.icon} className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground leading-snug">{mantra.title_en}</h2>
                <p className="font-telugu text-base sm:text-lg text-muted-foreground mt-0.5">{mantra.title_te}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mantra.deity && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {mantra.deity.name_en}
                </span>
              )}
              {mantra.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  <DynamicIcon name={mantra.category.icon} className="h-3 w-3" /> {mantra.category.name_en}
                </span>
              )}
              {mantra.tags?.slice(0, 3).map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div custom={1.5} initial="hidden" animate="visible" variants={sectionVariants}
            className="view-toggle-group"
          >
            {([
              { key: "telugu" as const, label: "తెలుగు" },
              { key: "english" as const, label: "English" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={cn(
                  "view-toggle-btn",
                  viewMode === key ? "view-toggle-btn--active" : "view-toggle-btn--inactive"
                )}
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Main text */}
          <div className="space-y-5">
            <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}
              className="mantra-text-container"
            >
              {viewMode === "telugu" ? (
                <p className="font-telugu leading-[2.2] text-foreground whitespace-pre-line text-center tracking-wide" style={{ fontSize: `${fontSize}px` }}>
                  {mantra.telugu_text}
                </p>
              ) : (
                <p className="leading-[2] text-foreground/80 whitespace-pre-line text-center" style={{ fontSize: `${Math.max(fontSize - 2, 14)}px` }}>
                  {mantra.transliteration}
                </p>
              )}
            </motion.section>

            {/* Meaning */}
            <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}
              className="meta-section"
            >
              <h3 className="meta-section-title">
                {viewMode === "telugu" ? "అర్థం" : "Meaning"}
              </h3>
              <p className={cn("text-sm leading-[1.85] text-foreground/85", viewMode === "telugu" && "font-telugu")}>
                {viewMode === "telugu" ? (mantra.meaning_te || mantra.meaning_en) : mantra.meaning_en}
              </p>
            </motion.section>

            {/* Benefits & When to Chant */}
            {(() => {
              const benefits = viewMode === "telugu" && benefitsTe.length > 0 ? benefitsTe : benefitsEn;
              const wtc = viewMode === "telugu" && whenToChantTe ? whenToChantTe : mantra.when_to_chant;
              return (
                <>
                  {benefits.length > 0 && (
                    <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}
                      className="meta-section"
                    >
                      <h3 className="meta-section-title">
                        {viewMode === "telugu" ? "ప్రయోజనాలు" : "Benefits"}
                      </h3>
                      <ul className="space-y-2.5">
                        {benefits.map((b: string, i: number) => (
                          <li key={i} className={cn("text-sm leading-[1.75] text-foreground/85 flex gap-2.5", viewMode === "telugu" && "font-telugu")}>
                            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mt-0.5">
                              {i + 1}
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.section>
                  )}
                  {wtc && (
                    <motion.section custom={5} initial="hidden" animate="visible" variants={sectionVariants}
                      className="meta-section"
                    >
                      <h3 className="meta-section-title">
                        {viewMode === "telugu" ? "ఎప్పుడు చదవాలి" : "When to Chant"}
                      </h3>
                      <p className={cn("text-sm leading-[1.75] text-foreground/85", viewMode === "telugu" && "font-telugu")}>{wtc}</p>
                      {mantra.chant_count && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-2.5">
                          <span className="text-sm font-semibold text-primary">{mantra.chant_count}×</span>
                          <span className="text-xs text-muted-foreground">{viewMode === "telugu" ? "సార్లు చదవాలి" : "recommended repetitions"}</span>
                        </div>
                      )}
                    </motion.section>
                  )}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default MantraDetail;
