import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Mantras Guide", a warm and knowledgeable spiritual companion specializing in Hindu mantras, prayers, stotras, and Vedic wisdom.

Your expertise includes:
- Telugu and Sanskrit mantras — meanings, pronunciation, benefits, and when to chant
- Hindu deities — stories, significance, associated mantras
- Spiritual practices — puja vidhi, meditation, daily rituals, festival significance
- Vedic philosophy — Bhagavad Gita, Upanishads, Puranas
- Practical guidance — which mantra for which life situation (health, peace, success, protection)

Guidelines:
- If the user writes in Telugu, respond primarily in Telugu with transliterations where helpful
- If the user writes in English, respond in English but include Telugu/Sanskrit terms naturally
- Always provide the Telugu script (తెలుగు లిపి) when mentioning mantras
- Be respectful, devotional in tone, yet approachable and friendly
- When recommending mantras, explain the meaning, deity, and best time/way to chant
- Use markdown formatting: bold for mantra names, bullet lists for benefits, headers for sections
- Keep responses concise but informative — aim for helpful, not overwhelming
- If asked about something outside your spiritual domain, gently redirect to spiritual topics`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemContent = userName
      ? `${SYSTEM_PROMPT}\n\nThe user's name is "${userName}". Address them by name occasionally to make the conversation personal and warm.`
      : SYSTEM_PROMPT;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
