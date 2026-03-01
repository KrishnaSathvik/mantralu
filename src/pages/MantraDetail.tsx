import { useParams, Link } from "react-router-dom";
import { mantras } from "@/data/sample-mantras";
import { useSettings } from "@/hooks/use-settings";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Share2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { PageTransition } from "@/components/PageTransition";
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
  const { fontSize, setFontSize, addRecentlyViewed, favorites, toggleFavorite, language } = useSettings();
  const [copied, setCopied] = useState(false);

  const mantra = mantras.find((m) => m.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (mantra) addRecentlyViewed(mantra.id);
  }, [mantra?.id]);

  if (!mantra) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center">
          <p className="text-muted-foreground">Mantra not found.</p>
          <Link to="/" className="text-primary mt-2 inline-block">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(mantra.id);

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
    const text = `${mantra.title_en}\n${mantra.title_te}\n\n${mantra.text_te}\n\n${mantra.transliteration}\n\n${mantra.meaning_en}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3 safe-area-top safe-area-x">
          <div className="mx-auto max-w-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-display text-lg font-bold text-foreground truncate">{mantra.title_en}</h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.85 }} onClick={handleShare} className="rounded-full p-2 hover:bg-secondary transition-colors" aria-label="Share">
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopy} className="rounded-full p-2 hover:bg-secondary transition-colors" aria-label="Copy">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 1.3 }}
                onClick={() => toggleFavorite(mantra.id)}
                className="rounded-full p-2 hover:bg-secondary transition-colors"
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("h-4 w-4", isFav ? "fill-primary text-primary" : "text-muted-foreground")} />
              </motion.button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-5 space-y-6 safe-area-x">
          {/* Title */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
            <h2 className="font-display text-2xl font-bold text-foreground">{mantra.title_en}</h2>
            <p className="font-telugu text-xl text-muted-foreground mt-1">{mantra.title_te}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{mantra.deity}</span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{mantra.category}</span>
              {mantra.tags.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">#{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Font size slider */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span className="text-xs text-muted-foreground">A</span>
            <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={16} max={36} step={1} className="flex-1" />
            <span className="text-lg font-bold text-muted-foreground">A</span>
            <span className="text-xs text-muted-foreground w-8 text-right">{fontSize}px</span>
          </motion.div>

          {/* Telugu Text */}
          {(language === "te" || language === "both") && (
            <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="rounded-xl border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Telugu Text</h3>
              <p className="font-telugu leading-[1.9] text-foreground whitespace-pre-line" style={{ fontSize: `${fontSize}px` }}>
                {mantra.text_te}
              </p>
            </motion.section>
          )}

          {/* Transliteration */}
          {(language === "en" || language === "both") && (
            <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants} className="rounded-xl border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Transliteration</h3>
              <p className="italic leading-[1.8] text-foreground/90 whitespace-pre-line" style={{ fontSize: `${Math.max(fontSize - 2, 14)}px` }}>
                {mantra.transliteration}
              </p>
            </motion.section>
          )}

          {/* Meaning */}
          <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants} className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Meaning</h3>
            <p className="text-base leading-relaxed text-foreground/85">{mantra.meaning_en}</p>
          </motion.section>

          {/* Benefits */}
          <motion.section custom={5} initial="hidden" animate="visible" variants={sectionVariants} className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Benefits</h3>
            <p className="text-sm leading-relaxed text-foreground/85">{mantra.benefits}</p>
          </motion.section>

          {/* When to chant */}
          <motion.section custom={6} initial="hidden" animate="visible" variants={sectionVariants} className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">When to Chant</h3>
            <p className="text-sm leading-relaxed text-foreground/85">{mantra.when_to_chant}</p>
            {mantra.chant_count && (
              <p className="mt-2 text-sm font-medium text-primary">Recommended: {mantra.chant_count} times</p>
            )}
          </motion.section>
        </main>
      </div>
    </PageTransition>
  );
};

export default MantraDetail;
