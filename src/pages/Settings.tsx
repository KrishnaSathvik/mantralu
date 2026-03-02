import { useSettings } from "@/hooks/use-settings";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0, 0, 0.2, 1] as const },
  }),
};

const Settings = () => {
  const { fontSize, setFontSize, darkMode, toggleDarkMode, language, setLanguage } = useSettings();

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <header className="page-header">
          <div className="page-header-inner">
            <h1 className="page-title">Settings</h1>
          </div>
        </header>

        <main className="page-main space-y-4">
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground mb-1">Font Size</h3>
            <p className="text-sm text-muted-foreground mb-4">Adjust text size for reading mantras</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">A</span>
              <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={16} max={36} step={1} className="flex-1" />
              <span className="text-lg font-bold text-muted-foreground">A</span>
              <span className="text-sm text-muted-foreground w-10 text-right tabular-nums">{fontSize}px</span>
            </div>
            <p className="font-telugu mt-3 text-muted-foreground text-center" style={{ fontSize: `${fontSize}px` }}>
              ఓం నమః శివాయ
            </p>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Easier reading in low light</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground mb-1">Language Display</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose which text to show on mantra pages</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "both", label: "Both" },
                { value: "te", label: "Telugu" },
                { value: "en", label: "English" },
              ] as const).map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguage(opt.value)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all border ${
                    language === opt.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground border-border hover:border-primary/40 active:bg-secondary"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="rounded-xl border bg-card p-4 sm:p-5">
            <h3 className="font-semibold text-foreground mb-1">About మంత్రాలు</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sacred Telugu mantras for daily devotion. Browse Hindu mantras, prayers, and stotras in Telugu and English.
              Built with love for spiritual seekers.
            </p>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Settings;
