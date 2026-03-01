import { useSettings } from "@/hooks/use-settings";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { fontSize, setFontSize, darkMode, toggleDarkMode, language, setLanguage } = useSettings();

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-6">
        {/* Font Size */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-1">Font Size</h3>
          <p className="text-sm text-muted-foreground mb-4">Adjust text size for reading mantras</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">A</span>
            <Slider
              value={[fontSize]}
              onValueChange={([v]) => setFontSize(v)}
              min={16}
              max={36}
              step={1}
              className="flex-1"
            />
            <span className="text-lg font-bold text-muted-foreground">A</span>
            <span className="text-sm text-muted-foreground w-10 text-right">{fontSize}px</span>
          </div>
          <p className="font-telugu mt-3 text-muted-foreground" style={{ fontSize: `${fontSize}px` }}>
            ఓం నమః శివాయ
          </p>
        </div>

        {/* Dark Mode */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">Easier reading in low light</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-1">Language Display</h3>
          <p className="text-sm text-muted-foreground mb-4">Choose which text to show on mantra pages</p>
          <div className="flex gap-2">
            {([
              { value: "both", label: "Both" },
              { value: "te", label: "Telugu Only" },
              { value: "en", label: "English Only" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border ${
                  language === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-1">About MantraVani</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A devotional app for browsing Hindu mantras, prayers, and stotras in Telugu and English.
            Built with love for spiritual seekers. 🙏
          </p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
