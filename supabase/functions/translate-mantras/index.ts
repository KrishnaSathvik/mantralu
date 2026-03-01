import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Get mantras missing Telugu translations
  const { data: mantras, error } = await supabase
    .from("mantras")
    .select("id, title_en, benefits, when_to_chant, benefits_te, when_to_chant_te")
    .eq("is_published", true);

  if (error) return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders });

  const toTranslate = mantras?.filter(m => 
    (m.benefits && m.benefits.length > 0 && !m.benefits_te) || 
    (m.when_to_chant && !m.when_to_chant_te)
  ) || [];

  console.log(`Found ${toTranslate.length} mantras needing translation`);
  if (toTranslate.length > 0) {
    console.log(`First mantra: ${JSON.stringify(toTranslate[0])}`);
  }
  let translated = 0;

  for (const mantra of toTranslate) {
    try {
      const parts: string[] = [];
      if (mantra.benefits && mantra.benefits.length > 0 && !mantra.benefits_te) {
        parts.push(`BENEFITS:\n${mantra.benefits.map((b: string, i: number) => `${i + 1}. ${b}`).join("\n")}`);
      }
      if (mantra.when_to_chant && !mantra.when_to_chant_te) {
        parts.push(`WHEN_TO_CHANT:\n${mantra.when_to_chant}`);
      }

      const prompt = `Translate the following text to Telugu. Keep the exact same structure and numbering. Return ONLY the translated text in the same format (BENEFITS: with numbered lines, WHEN_TO_CHANT: with text). No explanations.\n\nMantra: ${mantra.title_en}\n\n${parts.join("\n\n")}`;

      const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a Telugu translator. Translate devotional/spiritual content accurately to Telugu script. Return only the translated text." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      console.log(`AI response for ${mantra.title_en}: ${content.substring(0, 200)}`);

      const update: Record<string, any> = {};

      // Parse benefits
      if (content.includes("BENEFITS:") && mantra.benefits && !mantra.benefits_te) {
        const benefitsSection = content.split("BENEFITS:")[1]?.split("WHEN_TO_CHANT:")[0]?.trim();
        if (benefitsSection) {
          const benefitLines = benefitsSection
            .split("\n")
            .map((l: string) => l.replace(/^\d+\.\s*/, "").trim())
            .filter((l: string) => l.length > 0);
          if (benefitLines.length > 0) update.benefits_te = benefitLines;
        }
      }

      // Parse when_to_chant
      if (content.includes("WHEN_TO_CHANT:") && mantra.when_to_chant && !mantra.when_to_chant_te) {
        const wtcSection = content.split("WHEN_TO_CHANT:")[1]?.trim();
        if (wtcSection) update.when_to_chant_te = wtcSection;
      }

      if (Object.keys(update).length > 0) {
        await supabase.from("mantras").update(update).eq("id", mantra.id);
        translated++;
        console.log(`Translated: ${mantra.title_en}`);
      }
    } catch (e) {
      console.error(`Error translating ${mantra.title_en}:`, e);
    }
  }

  return new Response(JSON.stringify({ translated, total: toTranslate.length }), { headers: corsHeaders });
});
