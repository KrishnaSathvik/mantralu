import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Play, Eye, EyeOff, RefreshCw, ArrowLeft, Plus, Pencil, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "@/components/PageTransition";
import { MantraEditor } from "@/components/admin/MantraEditor";
import { DbMantra } from "@/hooks/use-mantras";

type ViewMode = "list" | "edit" | "create";

export default function Admin() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingMantra, setEditingMantra] = useState<DbMantra | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pipeline state
  const [scraping, setScraping] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedingVerses, setSeedingVerses] = useState(false);
  const [progress, setProgress] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);

  // Mantras list
  const [allMantras, setAllMantras] = useState<any[]>([]);
  const [loadingMantras, setLoadingMantras] = useState(false);

  const fetchAllMantras = async () => {
    setLoadingMantras(true);
    try {
      const { data, error } = await supabase
        .from("mantras")
        .select("*, deity:deities(*), category:categories(*)")
        .order("sort_order");
      if (error) throw error;
      setAllMantras(data || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingMantras(false);
    }
  };

  const handleEdit = (mantra: any) => {
    setEditingMantra(mantra as DbMantra);
    setViewMode("edit");
  };

  const handleCreate = () => {
    setEditingMantra(null);
    setViewMode("create");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingMantra(null);
    fetchAllMantras();
  };

  // Pipeline handlers (kept from original)
  const handleScrape = async () => {
    setScraping(true);
    setProgress("Scraping sanskritdocuments.org...");
    try {
      const { data, error } = await supabase.functions.invoke("scrape-mantras", { body: {} });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Scraping failed");
      setScrapedData(data);
      setProgress(`Scraped ${data.scraped_count} mantras. ${data.total_mantras} total defined.`);
      toast.success(`Got authentic text for ${data.scraped_count} mantras`);
    } catch (e: any) {
      setProgress(`Error: ${e.message}`);
      toast.error(e.message);
    } finally {
      setScraping(false);
    }
  };

  const handleSeed = async () => {
    if (!scrapedData) { toast.error("Scrape first"); return; }
    setSeeding(true);
    let batchStart = 0;
    const batchSize = 2;
    let totalProcessed = 0;
    try {
      while (true) {
        setProgress(`Seeding batch at ${batchStart}... (${totalProcessed} processed)`);
        const { data, error } = await supabase.functions.invoke("seed-mantras", {
          body: { scraped_data: scrapedData.results, mantra_sources: scrapedData.all_sources, batch_start: batchStart, batch_size: batchSize },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Failed");
        totalProcessed += data.processed || 0;
        if (data.remaining <= 0) break;
        batchStart = data.next_batch_start;
        await new Promise((r) => setTimeout(r, 2000));
      }
      setProgress(`Done! ${totalProcessed} new mantras seeded.`);
      toast.success(`${totalProcessed} mantras created`);
      fetchAllMantras();
      queryClient.invalidateQueries({ queryKey: ["mantras"] });
    } catch (e: any) {
      setProgress(`Error: ${e.message}`);
      toast.error(e.message);
    } finally {
      setSeeding(false);
    }
  };

  // Long mantras list for verse seeding
  const LONG_MANTRAS = [
    { slug: "hanuman-chalisa", verses: 43 }, { slug: "vishnu-sahasranama", verses: 30 },
    { slug: "lalitha-sahasranama", verses: 30 }, { slug: "suprabhatam", verses: 29 },
    { slug: "aditya-hrudayam", verses: 31 }, { slug: "shiva-tandava-stotram", verses: 13 },
    { slug: "lingashtakam", verses: 8 }, { slug: "bilvashtakam", verses: 9 },
    { slug: "kanakadhara-stotram", verses: 21 }, { slug: "ganesh-atharvashirsha", verses: 10 },
    { slug: "navagraha-stotram", verses: 9 }, { slug: "sankatanashana-ganesh-stotram", verses: 12 },
    { slug: "rama-raksha-stotram", verses: 20 }, { slug: "krishna-ashtakam", verses: 8 },
    { slug: "bhagavad-gita-ch12", verses: 20 }, { slug: "mahishasura-mardini", verses: 21 },
    { slug: "bajrang-baan", verses: 20 }, { slug: "sri-suktam", verses: 16 },
    { slug: "purusha-suktam", verses: 16 }, { slug: "narayana-suktam", verses: 12 },
    { slug: "durga-suktam", verses: 10 }, { slug: "medha-suktam", verses: 10 },
    { slug: "pratah-smarana", verses: 6 }, { slug: "om-jai-jagdish", verses: 9 },
    { slug: "ganesh-aarti", verses: 6 }, { slug: "shiva-aarti", verses: 6 },
    { slug: "hanuman-aarti", verses: 6 }, { slug: "lakshmi-aarti", verses: 6 },
    { slug: "rama-ashtottara", verses: 12 }, { slug: "govinda-namavali", verses: 10 },
    { slug: "devi-stuti", verses: 8 }, { slug: "sashti-kavacham", verses: 10 },
  ];

  const seedVersesForMantra = async (slug: string, totalVerses: number): Promise<number> => {
    let batchStart = 0;
    const batchSize = 8;
    let totalProcessed = 0;
    while (true) {
      const { data, error } = await supabase.functions.invoke("seed-verses", {
        body: { mantra_slug: slug, total_verses: totalVerses, batch_start: batchStart, batch_size: batchSize },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed");
      totalProcessed += data.processed || 0;
      if (data.remaining <= 0) break;
      batchStart = data.next_batch_start;
      await new Promise((r) => setTimeout(r, 2000));
    }
    return totalProcessed;
  };

  const handleSeedAllVerses = async () => {
    setSeedingVerses(true);
    let grandTotal = 0;
    try {
      for (let i = 0; i < LONG_MANTRAS.length; i++) {
        const { slug, verses } = LONG_MANTRAS[i];
        setProgress(`[${i + 1}/${LONG_MANTRAS.length}] Seeding ${slug}...`);
        try {
          const count = await seedVersesForMantra(slug, verses);
          grandTotal += count;
        } catch (e: any) {
          setProgress(`[${i + 1}/${LONG_MANTRAS.length}] ${slug}: ERROR - ${e.message}`);
        }
        if (i < LONG_MANTRAS.length - 1) await new Promise((r) => setTimeout(r, 1500));
      }
      setProgress(`Done! ${grandTotal} verses seeded.`);
      toast.success(`${grandTotal} verses across ${LONG_MANTRAS.length} mantras`);
      queryClient.invalidateQueries({ queryKey: ["mantra-verses"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSeedingVerses(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("mantras").update({ is_published: !currentStatus }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setAllMantras((prev) => prev.map((m) => (m.id === id ? { ...m, is_published: !currentStatus } : m)));
      queryClient.invalidateQueries({ queryKey: ["mantras"] });
    }
  };

  // Filter mantras
  const filtered = searchQuery
    ? allMantras.filter(
        (m) =>
          m.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.title_te?.includes(searchQuery) ||
          m.slug.includes(searchQuery.toLowerCase())
      )
    : allMantras;

  // Show editor view
  if (viewMode === "edit" || viewMode === "create") {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4 pb-24 max-w-2xl mx-auto">
          <MantraEditor
            mantra={editingMantra}
            onBack={handleBackToList}
            onSaved={handleBackToList}
          />
        </div>
      </PageTransition>
    );
  }

  // List view
  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 pb-24 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Content Admin</h1>
        </div>

        {/* Pipeline Controls */}
        <Card className="p-4 mb-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Hybrid Content Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Step 1: Scrape. Step 2: AI seed. Step 3: Seed verses. Or manually edit below.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleScrape} disabled={scraping || seeding} variant="outline" size="sm">
              {scraping ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              1. Scrape
            </Button>
            <Button onClick={handleSeed} disabled={seeding || !scrapedData} size="sm">
              {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              2. AI Seed
            </Button>
            <Button onClick={handleSeedAllVerses} disabled={seedingVerses} variant="outline" size="sm">
              {seedingVerses ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              3. Seed Verses
            </Button>
          </div>
          {progress && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs bg-muted p-3 rounded-lg font-mono break-all"
            >
              {progress}
            </motion.div>
          )}
        </Card>

        {/* Mantras List */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Mantras ({allMantras.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchAllMantras} disabled={loadingMantras}>
              <RefreshCw className={`h-4 w-4 ${loadingMantras ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {allMantras.length > 0 && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mantras..."
              className="pl-9 h-9"
            />
          </div>
        )}

        {allMantras.length === 0 && !loadingMantras && (
          <Card className="p-6 text-center text-muted-foreground">
            Click Refresh to load mantras, or create a new one.
          </Card>
        )}

        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((mantra) => (
              <motion.div key={mantra.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <button onClick={() => handleEdit(mantra)}
                        className="font-medium text-sm hover:text-primary transition-colors truncate block text-left w-full"
                      >
                        {mantra.title_en}
                      </button>
                      <p className="text-xs text-muted-foreground font-telugu truncate">{mantra.title_te}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {mantra.deity && <Badge variant="secondary" className="text-xs">{mantra.deity.name_en}</Badge>}
                        {mantra.category && <Badge variant="outline" className="text-xs">{mantra.category.name_en}</Badge>}
                        <Badge variant={mantra.is_published ? "default" : "secondary"} className="text-xs">
                          {mantra.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEdit(mantra)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => togglePublish(mantra.id, mantra.is_published)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title={mantra.is_published ? "Unpublish" : "Publish"}
                      >
                        {mantra.is_published ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
