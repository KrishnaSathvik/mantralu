import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { scraped_data, mantra_sources, batch_start = 0, batch_size = 5 } = await req.json();

    // Get existing deities and categories for FK mapping
    const { data: deities } = await supabase.from("deities").select("id, name_en");
    const { data: categories } = await supabase.from("categories").select("id, slug");

    const deityMap: Record<string, string> = {};
    deities?.forEach((d: any) => { deityMap[d.name_en] = d.id; });
    const catMap: Record<string, string> = {};
    categories?.forEach((c: any) => { catMap[c.slug] = c.id; });

    // Get slugs to process in this batch
    const allSlugs = Object.keys(mantra_sources);
    const batchSlugs = allSlugs.slice(batch_start, batch_start + batch_size);

    if (batchSlugs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "All batches complete", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check which mantras already exist
    const { data: existing } = await supabase
      .from("mantras")
      .select("slug")
      .in("slug", batchSlugs);
    const existingSlugs = new Set(existing?.map((e: any) => e.slug) || []);
    const newSlugs = batchSlugs.filter((s) => !existingSlugs.has(s));

    if (newSlugs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "All mantras in this batch already exist",
          processed: 0,
          next_batch_start: batch_start + batch_size,
          remaining: allSlugs.length - (batch_start + batch_size),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build AI prompt for this batch
    const mantrasToGenerate = newSlugs.map((slug) => {
      const source = mantra_sources[slug];
      const scraped = scraped_data?.[slug] || "";
      return {
        slug,
        ...source,
        scraped_text: scraped ? scraped.substring(0, 3000) : "No scraped text available",
      };
    });

    const prompt = `You are a Hindu scripture expert. Generate complete mantra data for these mantras.

For each mantra, provide:
1. telugu_text: The COMPLETE mantra/stotra in Telugu script. If scraped text is provided, use it as reference but ensure proper Telugu script.
2. transliteration: IAST/English transliteration of the Telugu text
3. meaning_en: English translation/meaning
4. benefits: Array of 3-5 benefits of chanting this mantra
5. when_to_chant: When and how to chant this mantra

CRITICAL: The Telugu text must be accurate and complete. Use the scraped reference text when available.

Mantras to generate:
${JSON.stringify(mantrasToGenerate, null, 2)}

Respond with a JSON array (no markdown, just raw JSON) where each object has:
{ "slug": "...", "telugu_text": "...", "transliteration": "...", "meaning_en": "...", "benefits": ["..."], "when_to_chant": "..." }`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a Hindu scripture and Sanskrit/Telugu expert. Return ONLY valid JSON arrays, no markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      throw new Error(`AI gateway error ${aiResp.status}: ${errText}`);
    }

    const aiData = await aiResp.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let generatedMantras: any[];
    try {
      generatedMantras = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse AI response: ${content.substring(0, 200)}`);
    }

    // Insert into DB
    const inserts = generatedMantras.map((m: any, idx: number) => {
      const source = mantra_sources[m.slug];
      return {
        slug: m.slug,
        title_en: source.title_en,
        title_te: source.title_te,
        deity_id: deityMap[source.deity] || null,
        category_id: catMap[source.category] || null,
        telugu_text: m.telugu_text,
        transliteration: m.transliteration,
        meaning_en: m.meaning_en,
        benefits: m.benefits || [],
        when_to_chant: m.when_to_chant || null,
        tags: source.tags,
        is_published: false, // Draft — needs review
        sort_order: (batch_start + idx) * 10,
      };
    });

    const { data: inserted, error: insertError } = await supabase
      .from("mantras")
      .insert(inserts)
      .select("id, slug, title_en");

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        processed: inserted?.length || 0,
        mantras: inserted?.map((m: any) => m.title_en),
        next_batch_start: batch_start + batch_size,
        remaining: allSlugs.length - (batch_start + batch_size),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed-mantras error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
