import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// The 50+ mantras we need, mapped to sanskritdocuments.org paths where available
const MANTRA_SOURCES: Record<string, { url?: string; title_en: string; title_te: string; deity: string; category: string; tags: string[] }> = {
  "gayatri-mantra": { url: "https://sanskritdocuments.org/doc_vishhNu/gayatri.html", title_en: "Gayatri Mantra", title_te: "గాయత్రీ మంత్రం", deity: "Surya", category: "daily-prayers", tags: ["morning", "daily", "vedic"] },
  "ganesh-vandana": { url: "https://sanskritdocuments.org/doc_ganesha/gaNeshvan.html", title_en: "Ganesh Vandana", title_te: "గణేశ వందన", deity: "Ganesha", category: "deity-mantras", tags: ["beginning", "obstacles"] },
  "panchakshari-mantra": { title_en: "Panchakshari Mantra", title_te: "పంచాక్షరీ మంత్రం", deity: "Shiva", category: "deity-mantras", tags: ["shiva", "daily", "monday"] },
  "maha-mantra": { title_en: "Maha Mantra", title_te: "మహా మంత్రం", deity: "Krishna", category: "deity-mantras", tags: ["krishna", "daily", "healing"] },
  "hanuman-chalisa": { url: "https://sanskritdocuments.org/doc_hanumaana/hanumanChaalisa.html", title_en: "Hanuman Chalisa", title_te: "హనుమాన్ చాలీసా", deity: "Hanuman", category: "stotras", tags: ["tuesday", "saturday", "protection"] },
  "mrityunjaya-mantra": { title_en: "Maha Mrityunjaya Mantra", title_te: "మహా మృత్యుంజయ మంత్రం", deity: "Shiva", category: "healing", tags: ["healing", "protection", "shiva"] },
  "vishnu-sahasranama": { url: "https://sanskritdocuments.org/doc_vishhNu/vsahasra.html", title_en: "Vishnu Sahasranama", title_te: "విష్ణు సహస్రనామం", deity: "Vishnu", category: "stotras", tags: ["vishnu", "daily", "powerful"] },
  "lalitha-sahasranama": { url: "https://sanskritdocuments.org/doc_devii/lalita1000.html", title_en: "Lalitha Sahasranama", title_te: "లలితా సహస్రనామం", deity: "Durga", category: "stotras", tags: ["devi", "friday", "powerful"] },
  "suprabhatam": { url: "https://sanskritdocuments.org/doc_vishhNu/venksup.html", title_en: "Sri Venkateswara Suprabhatam", title_te: "శ్రీ వేంకటేశ్వర సుప్రభాతం", deity: "Vishnu", category: "daily-prayers", tags: ["morning", "daily"] },
  "aditya-hrudayam": { url: "https://sanskritdocuments.org/doc_z_misc_major/AdityahRRidayam.html", title_en: "Aditya Hrudayam", title_te: "ఆదిత్య హృదయం", deity: "Surya", category: "daily-prayers", tags: ["morning", "sunday", "healing"] },
  "guru-mantra": { title_en: "Guru Mantra", title_te: "గురు మంత్రం", deity: "Universal", category: "daily-prayers", tags: ["daily", "thursday", "guru"] },
  "lakshmi-mantra": { title_en: "Sri Lakshmi Mantra", title_te: "శ్రీ లక్ష్మీ మంత్రం", deity: "Lakshmi", category: "prosperity", tags: ["friday", "prosperity", "wealth"] },
  "durga-suktam": { url: "https://sanskritdocuments.org/doc_devii/durgaasuukta.html", title_en: "Durga Suktam", title_te: "దుర్గా సూక్తం", deity: "Durga", category: "deity-mantras", tags: ["devi", "protection", "navaratri"] },
  "sri-suktam": { url: "https://sanskritdocuments.org/doc_vishhNu/shriisukta.html", title_en: "Sri Suktam", title_te: "శ్రీ సూక్తం", deity: "Lakshmi", category: "prosperity", tags: ["friday", "wealth", "vedic"] },
  "purusha-suktam": { url: "https://sanskritdocuments.org/doc_vishhNu/puruSha.html", title_en: "Purusha Suktam", title_te: "పురుష సూక్తం", deity: "Vishnu", category: "stotras", tags: ["vedic", "powerful"] },
  "narayana-suktam": { title_en: "Narayana Suktam", title_te: "నారాయణ సూక్తం", deity: "Vishnu", category: "stotras", tags: ["vishnu", "vedic"] },
  "ganesh-atharvashirsha": { url: "https://sanskritdocuments.org/doc_ganesha/gaNeshaatha.html", title_en: "Ganapati Atharvashirsha", title_te: "గణపతి అథర్వశీర్ష", deity: "Ganesha", category: "stotras", tags: ["ganesha", "wednesday", "vedic"] },
  "shiva-tandava-stotram": { url: "https://sanskritdocuments.org/doc_shiva/shivatANDava.html", title_en: "Shiva Tandava Stotram", title_te: "శివ తాండవ స్తోత్రం", deity: "Shiva", category: "stotras", tags: ["shiva", "monday", "powerful"] },
  "lingashtakam": { url: "https://sanskritdocuments.org/doc_shiva/lingaaShTaka.html", title_en: "Lingashtakam", title_te: "లింగాష్టకం", deity: "Shiva", category: "stotras", tags: ["shiva", "monday"] },
  "bilvashtakam": { title_en: "Bilvashtakam", title_te: "బిల్వాష్టకం", deity: "Shiva", category: "stotras", tags: ["shiva", "monday"] },
  "rudrashtakam": { url: "https://sanskritdocuments.org/doc_shiva/rudrAShTakam.html", title_en: "Rudrashtakam", title_te: "రుద్రాష్టకం", deity: "Shiva", category: "stotras", tags: ["shiva", "monday"] },
  "kanakadhara-stotram": { url: "https://sanskritdocuments.org/doc_devii/kanakadhArA.html", title_en: "Kanakadhara Stotram", title_te: "కనకధారా స్తోత్రం", deity: "Lakshmi", category: "prosperity", tags: ["lakshmi", "friday", "wealth"] },
  "saraswati-vandana": { title_en: "Saraswati Vandana", title_te: "సరస్వతీ వందన", deity: "Saraswati", category: "deity-mantras", tags: ["saraswati", "education", "wednesday"] },
  "saraswati-mantra": { title_en: "Saraswati Mantra", title_te: "సరస్వతీ మంత్రం", deity: "Saraswati", category: "deity-mantras", tags: ["saraswati", "education"] },
  "medha-suktam": { url: "https://sanskritdocuments.org/doc_z_misc_major/medhaasuukta.html", title_en: "Medha Suktam", title_te: "మేధా సూక్తం", deity: "Saraswati", category: "deity-mantras", tags: ["education", "vedic", "intelligence"] },
  "navagraha-stotram": { url: "https://sanskritdocuments.org/doc_z_misc_navagraha/navagraha.html", title_en: "Navagraha Stotram", title_te: "నవగ్రహ స్తోత్రం", deity: "Universal", category: "daily-prayers", tags: ["planets", "daily"] },
  "sankatanashana-ganesh-stotram": { title_en: "Sankatanashana Ganesh Stotram", title_te: "సంకటనాశన గణేశ స్తోత్రం", deity: "Ganesha", category: "deity-mantras", tags: ["ganesha", "obstacles"] },
  "vakratunda-mahakaya": { title_en: "Vakratunda Mahakaya", title_te: "వక్రతుండ మహాకాయ", deity: "Ganesha", category: "deity-mantras", tags: ["ganesha", "beginning"] },
  "ganesh-aarti": { title_en: "Ganesh Aarti", title_te: "గణేశ ఆరతి", deity: "Ganesha", category: "aartis", tags: ["ganesha", "aarti"] },
  "shiva-aarti": { title_en: "Shiva Aarti", title_te: "శివ ఆరతి", deity: "Shiva", category: "aartis", tags: ["shiva", "aarti"] },
  "hanuman-aarti": { title_en: "Hanuman Aarti", title_te: "హనుమాన్ ఆరతి", deity: "Hanuman", category: "aartis", tags: ["hanuman", "aarti"] },
  "lakshmi-aarti": { title_en: "Lakshmi Aarti", title_te: "లక్ష్మీ ఆరతి", deity: "Lakshmi", category: "aartis", tags: ["lakshmi", "aarti", "friday"] },
  "om-jai-jagdish": { title_en: "Om Jai Jagdish Hare", title_te: "ఓం జై జగదీశ్ హరే", deity: "Vishnu", category: "aartis", tags: ["aarti", "evening", "daily"] },
  "rama-raksha-stotram": { url: "https://sanskritdocuments.org/doc_raama/raamarakShaa.html", title_en: "Rama Raksha Stotram", title_te: "రామ రక్షా స్తోత్రం", deity: "Rama", category: "stotras", tags: ["rama", "protection"] },
  "rama-mantra": { title_en: "Sri Rama Mantra", title_te: "శ్రీ రామ మంత్రం", deity: "Rama", category: "deity-mantras", tags: ["rama", "daily"] },
  "rama-ashtottara": { title_en: "Rama Ashtottara", title_te: "రామ అష్టోత్తరం", deity: "Rama", category: "stotras", tags: ["rama", "108names"] },
  "krishna-ashtakam": { url: "https://sanskritdocuments.org/doc_vishhNu/kRRiShNAShTaka.html", title_en: "Krishna Ashtakam", title_te: "కృష్ణాష్టకం", deity: "Krishna", category: "stotras", tags: ["krishna", "wednesday"] },
  "govinda-namavali": { title_en: "Govinda Namavali", title_te: "గోవింద నామావళి", deity: "Krishna", category: "deity-mantras", tags: ["krishna", "vishnu"] },
  "bhagavad-gita-ch12": { title_en: "Bhagavad Gita Chapter 12", title_te: "భగవద్గీత 12వ అధ్యాయం", deity: "Krishna", category: "stotras", tags: ["krishna", "gita", "bhakti"] },
  "mahishasura-mardini": { url: "https://sanskritdocuments.org/doc_devii/mahiShaasura.html", title_en: "Mahishasura Mardini Stotram", title_te: "మహిషాసుర మర్దినీ స్తోత్రం", deity: "Durga", category: "stotras", tags: ["devi", "navaratri", "powerful"] },
  "devi-stuti": { title_en: "Devi Stuti", title_te: "దేవీ స్తుతి", deity: "Durga", category: "deity-mantras", tags: ["devi", "friday"] },
  "subramanya-mantra": { title_en: "Subramanya Mantra", title_te: "సుబ్రమణ్య మంత్రం", deity: "Subramanya", category: "deity-mantras", tags: ["subramanya", "tuesday"] },
  "sashti-kavacham": { title_en: "Sashti Kavacham", title_te: "షష్ఠీ కవచం", deity: "Subramanya", category: "stotras", tags: ["subramanya", "protection"] },
  "dhanvantari-mantra": { title_en: "Dhanvantari Mantra", title_te: "ధన్వంతరి మంత్రం", deity: "Vishnu", category: "healing", tags: ["healing", "health"] },
  "pratah-smarana": { title_en: "Pratah Smarana Stotram", title_te: "ప్రాతః స్మరణ స్తోత్రం", deity: "Universal", category: "daily-prayers", tags: ["morning", "daily"] },
  "shanti-mantra": { title_en: "Shanti Mantra", title_te: "శాంతి మంత్రం", deity: "Universal", category: "daily-prayers", tags: ["peace", "daily", "vedic"] },
  "evening-lamp-prayer": { title_en: "Deepa Jyoti Mantra", title_te: "దీప జ్యోతి మంత్రం", deity: "Universal", category: "daily-prayers", tags: ["evening", "daily", "lamp"] },
  "food-prayer": { title_en: "Brahmarpanam (Food Prayer)", title_te: "బ్రహ్మార్పణం", deity: "Universal", category: "daily-prayers", tags: ["daily", "food", "gita"] },
  "bedtime-prayer": { title_en: "Bedtime Prayer (Kara Charana Kritam)", title_te: "కరచరణ కృతం", deity: "Universal", category: "daily-prayers", tags: ["night", "daily"] },
  "bajrang-baan": { title_en: "Bajrang Baan", title_te: "బజరంగ్ బాణ", deity: "Hanuman", category: "stotras", tags: ["hanuman", "tuesday", "protection", "powerful"] },
  "lakshmi-ashtottara": { title_en: "Lakshmi Ashtottara", title_te: "లక్ష్మీ అష్టోత్తరం", deity: "Lakshmi", category: "stotras", tags: ["lakshmi", "friday", "108names"] },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const { slugs } = await req.json(); // optional: specific slugs to scrape
    const toScrape = slugs
      ? Object.entries(MANTRA_SOURCES).filter(([s]) => slugs.includes(s))
      : Object.entries(MANTRA_SOURCES).filter(([_, v]) => v.url);

    const results: Record<string, string> = {};

    // Scrape in batches of 3 to avoid rate limits
    for (let i = 0; i < toScrape.length; i += 3) {
      const batch = toScrape.slice(i, i + 3);
      const promises = batch.map(async ([slug, source]) => {
        if (!source.url) return;
        try {
          const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: source.url,
              formats: ["markdown"],
              onlyMainContent: true,
            }),
          });
          const data = await resp.json();
          if (data.success || data.data?.markdown) {
            results[slug] = data.data?.markdown || data.markdown || "";
          }
        } catch (e) {
          console.error(`Failed to scrape ${slug}:`, e);
        }
      });
      await Promise.all(promises);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scraped_count: Object.keys(results).length,
        total_mantras: Object.keys(MANTRA_SOURCES).length,
        results,
        all_sources: MANTRA_SOURCES,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scrape-mantras error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
