import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useMantras } from "@/hooks/use-mantras";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Eye, EyeOff, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PageTransition } from "@/components/PageTransition";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scraping, setScraping] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);

  // Fetch ALL mantras (including drafts) using service role via edge function
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
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingMantras(false);
    }
  };

  // Step 1: Scrape from trusted sources
  const handleScrape = async () => {
    setScraping(true);
    setProgress("Scraping sanskritdocuments.org... this may take a minute");
    try {
      const { data, error } = await supabase.functions.invoke("scrape-mantras", {
        body: {},
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Scraping failed");

      setScrapedData(data);
      setProgress(`Scraped ${data.scraped_count} mantras from trusted sources. ${data.total_mantras} total mantras defined.`);
      toast({
        title: "Scraping complete!",
        description: `Got authentic text for ${data.scraped_count} mantras`,
      });
    } catch (e: any) {
      setProgress(`Scraping error: ${e.message}`);
      toast({ title: "Scrape failed", description: e.message, variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  // Step 2: AI-generate and seed mantras in batches
  const handleSeed = async () => {
    if (!scrapedData) {
      toast({ title: "Scrape first", description: "Run the scraper before seeding", variant: "destructive" });
      return;
    }
    setSeeding(true);
    let batchStart = 0;
    const batchSize = 2;
    let totalProcessed = 0;

    try {
      while (true) {
        setProgress(`Seeding batch starting at ${batchStart}... (${totalProcessed} processed so far)`);

        const { data, error } = await supabase.functions.invoke("seed-mantras", {
          body: {
            scraped_data: scrapedData.results,
            mantra_sources: scrapedData.all_sources,
            batch_start: batchStart,
            batch_size: batchSize,
          },
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Seeding failed");

        totalProcessed += data.processed || 0;
        setProgress(`Processed batch: ${data.mantras?.join(", ") || "skipped existing"}. Total: ${totalProcessed}. Remaining: ${data.remaining}`);

        if (data.remaining <= 0) break;
        batchStart = data.next_batch_start;

        // Small delay between batches to avoid rate limits
        await new Promise((r) => setTimeout(r, 2000));
      }

      setProgress(`Done! ${totalProcessed} new mantras seeded as drafts.`);
      toast({ title: "Seeding complete!", description: `${totalProcessed} mantras created as drafts` });
      fetchAllMantras();
      queryClient.invalidateQueries({ queryKey: ["mantras"] });
    } catch (e: any) {
      setProgress(`Seeding error at batch ${batchStart}: ${e.message}`);
      toast({ title: "Seed failed", description: e.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  // Toggle publish status
  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("mantras")
      .update({ is_published: !currentStatus })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAllMantras((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_published: !currentStatus } : m))
      );
      queryClient.invalidateQueries({ queryKey: ["mantras"] });
    }
  };

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
            Step 1: Scrape authentic Telugu text from trusted sources. Step 2: AI generates structure + fills gaps. All mantras are seeded as drafts.
          </p>

          <div className="flex gap-3">
            <Button onClick={handleScrape} disabled={scraping || seeding} variant="outline">
              {scraping ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              1. Scrape Sources
            </Button>
            <Button onClick={handleSeed} disabled={seeding || !scrapedData} className="bg-primary text-primary-foreground">
              {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              2. AI Seed Mantras
            </Button>
          </div>

          {progress && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm bg-muted p-3 rounded-lg font-mono"
            >
              {progress}
            </motion.div>
          )}
        </Card>

        {/* Mantras List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">All Mantras ({allMantras.length})</h2>
          <Button variant="ghost" size="sm" onClick={fetchAllMantras} disabled={loadingMantras}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingMantras ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {allMantras.length === 0 && !loadingMantras && (
          <Card className="p-6 text-center text-muted-foreground">
            <p>Click Refresh to load mantras, or run the pipeline above to seed new ones.</p>
          </Card>
        )}

        <div className="space-y-2">
          <AnimatePresence>
            {allMantras.map((mantra) => (
              <motion.div
                key={mantra.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/mantra/${mantra.slug}`}
                        className="font-medium text-sm hover:text-primary transition-colors truncate block"
                      >
                        {mantra.title_en}
                      </Link>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {mantra.deity && (
                          <Badge variant="secondary" className="text-xs">
                            {mantra.deity.icon} {mantra.deity.name_en}
                          </Badge>
                        )}
                        {mantra.category && (
                          <Badge variant="outline" className="text-xs">
                            {mantra.category.name_en}
                          </Badge>
                        )}
                        <Badge
                          variant={mantra.is_published ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mantra.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePublish(mantra.id, mantra.is_published)}
                      className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                      title={mantra.is_published ? "Unpublish" : "Publish"}
                    >
                      {mantra.is_published ? (
                        <Eye className="h-4 w-4 text-primary" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
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
