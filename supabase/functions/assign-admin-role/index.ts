import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "krishnasathvikm@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email } = await req.json();

    // Only allow the designated admin email
    if (email !== ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: "Unauthorized email" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert admin role
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id, role: "admin" }, { onConflict: "user_id,role" });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
