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

    const { mantra_slug, batch_start = 0, batch_size = 10 } = await req.json();

    if (!mantra_slug) throw new Error("mantra_slug is required");

    // Get the mantra
    const { data: mantra, error: mantraErr } = await supabase
      .from("mantras")
      .select("id, title_en, slug")
      .eq("slug", mantra_slug)
      .single();

    if (mantraErr || !mantra) throw new Error(`Mantra not found: ${mantra_slug}`);

    // Check existing verses
    const { data: existingVerses } = await supabase
      .from("mantra_verses")
      .select("verse_number")
      .eq("mantra_id", mantra.id)
      .order("verse_number");

    const existingNumbers = new Set(existingVerses?.map((v: any) => v.verse_number) || []);

    // Determine which verses to generate in this batch
    const versesToGenerate: number[] = [];
    for (let i = batch_start + 1; i <= batch_start + batch_size; i++) {
      if (!existingNumbers.has(i)) {
        versesToGenerate.push(i);
      }
    }

    // For Hanuman Chalisa: 2 dohas (opening) + 40 chaupais + 1 doha (closing) = 43 total
    const totalVerses = mantra_slug === "hanuman-chalisa" ? 43 : 40;

    if (batch_start >= totalVerses) {
      return new Response(
        JSON.stringify({ success: true, message: "All verses complete", processed: 0, remaining: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (versesToGenerate.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "All verses in this batch already exist",
          processed: 0,
          next_batch_start: batch_start + batch_size,
          remaining: Math.max(0, totalVerses - (batch_start + batch_size)),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startVerse = versesToGenerate[0];
    const endVerse = versesToGenerate[versesToGenerate.length - 1];

    const prompt = `Generate verses ${startVerse} to ${endVerse} of the Hanuman Chalisa in a JSON array.

The Hanuman Chalisa structure:
- Verse 1-2: Opening Dohas
- Verses 3-42: The 40 Chaupais (main verses)
- Verse 43: Closing Doha

Return a JSON array (no markdown, no code fences) where each element has:
- "verse_number": integer
- "telugu": The verse in Telugu script (authentic, complete)
- "transliteration": IAST transliteration
- "meaning_en": English meaning (1-2 sentences)

IMPORTANT: Return ONLY the JSON array. Each verse should be 2-4 lines of Telugu text. Be authentic and complete.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a Hindu scripture expert specializing in Hanuman Chalisa. Return ONLY valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        max_tokens: 4000,
      }),
    });

    if (!aiResp.ok) {
      throw new Error(`AI error: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let verses: any[];
    try {
      verses = JSON.parse(content);
    } catch {
      // Try to salvage truncated JSON
      try {
        const lastBracket = content.lastIndexOf("}");
        const truncated = content.substring(0, lastBracket + 1) + "]";
        verses = JSON.parse(truncated);
      } catch {
        throw new Error(`Failed to parse AI response: ${content.substring(0, 200)}`);
      }
    }

    if (!Array.isArray(verses)) {
      throw new Error("AI response is not an array");
    }

    // Insert verses
    const rows = verses.map((v: any) => ({
      mantra_id: mantra.id,
      verse_number: v.verse_number,
      telugu: v.telugu || "",
      transliteration: v.transliteration || null,
      meaning_en: v.meaning_en || null,
    }));

    const { data: inserted, error: insErr } = await supabase
      .from("mantra_verses")
      .insert(rows)
      .select("id, verse_number");

    if (insErr) throw new Error(`Insert error: ${insErr.message}`);

    const remaining = Math.max(0, totalVerses - (batch_start + batch_size));

    return new Response(
      JSON.stringify({
        success: true,
        processed: inserted?.length || 0,
        verses_inserted: inserted?.map((v: any) => v.verse_number) || [],
        next_batch_start: batch_start + batch_size,
        remaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed-verses error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
