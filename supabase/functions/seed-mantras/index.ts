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

    const { scraped_data, mantra_sources, batch_start = 0, batch_size = 2 } = await req.json();

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

    // Process ONE mantra at a time to avoid truncation
    const inserted: any[] = [];
    for (const slug of newSlugs) {
      const source = mantra_sources[slug];
      const scraped = scraped_data?.[slug] || "";
      const scrapedSnippet = scraped ? scraped.substring(0, 2000) : "";

      const prompt = `Generate mantra data for: "${source.title_en}" (${source.title_te})

${scrapedSnippet ? `Reference text (use as basis for Telugu):\n${scrapedSnippet}\n` : ""}

Return a single JSON object (no markdown, no code fences) with these fields:
- "telugu_text": The mantra in Telugu script. For SHORT mantras (1-4 lines), give the complete text. For LONG stotras (like Sahasranama, Chalisa), give the first 8-10 key verses only with "..." at end.
- "transliteration": English transliteration (IAST style)
- "meaning_en": English meaning/translation (2-4 sentences for short mantras, summary for long ones)
- "benefits": Array of 3-4 short benefit strings
- "when_to_chant": One sentence about when to chant

IMPORTANT: Keep response concise. Output ONLY the JSON object, nothing else.`;

      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a Hindu scripture expert. Return ONLY valid JSON, no markdown." },
              { role: "user", content: prompt },
            ],
            max_tokens: 2000,
          }),
        });

        if (!aiResp.ok) {
          console.error(`AI error for ${slug}: ${aiResp.status}`);
          continue;
        }

        const aiData = await aiResp.json();
        let content = aiData.choices?.[0]?.message?.content || "";
        content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let parsed: any;
        try {
          parsed = JSON.parse(content);
        } catch {
          // Try to salvage truncated JSON by closing it
          try {
            // Find last complete field
            const lastQuote = content.lastIndexOf('"');
            const truncated = content.substring(0, lastQuote + 1) + '}';
            parsed = JSON.parse(truncated);
          } catch {
            console.error(`Failed to parse for ${slug}, skipping`);
            continue;
          }
        }

        const row = {
          slug,
          title_en: source.title_en,
          title_te: source.title_te,
          deity_id: deityMap[source.deity] || null,
          category_id: catMap[source.category] || null,
          telugu_text: parsed.telugu_text || source.title_te,
          transliteration: parsed.transliteration || "",
          meaning_en: parsed.meaning_en || "",
          benefits: parsed.benefits || [],
          when_to_chant: parsed.when_to_chant || null,
          tags: source.tags,
          is_published: false,
          sort_order: (batch_start + newSlugs.indexOf(slug)) * 10,
        };

        const { data: ins, error: insErr } = await supabase
          .from("mantras")
          .insert(row)
          .select("id, slug, title_en");

        if (insErr) {
          console.error(`Insert error for ${slug}:`, insErr);
        } else if (ins) {
          inserted.push(...ins);
        }
      } catch (e) {
        console.error(`Error processing ${slug}:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: inserted.length,
        mantras: inserted.map((m: any) => m.title_en),
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
