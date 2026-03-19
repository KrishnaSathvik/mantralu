import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MantraCard } from "@/components/MantraCard";
import { StaggerContainer, StaggerItem } from "@/components/PageTransition";
import type { DbMantra } from "@/hooks/use-mantras";

const UGADI_DATE = "2026-03-19";

function useUgadiMantras() {
  return useQuery({
    queryKey: ["ugadi-mantras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mantras")
        .select("*, deity:deities(*), category:categories(*)")
        .eq("is_published", true)
        .contains("tags", ["ugadi"])
        .order("sort_order");
      if (error) throw error;
      return data as unknown as DbMantra[];
    },
  });
}

export const UgadiBanner = () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data: ugadiMantras } = useUgadiMantras();
  
  if (today !== UGADI_DATE) return null;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl mx-auto"
        style={{
          background: "linear-gradient(135deg, hsl(45, 90%, 55%) 0%, hsl(27, 85%, 50%) 50%, hsl(0, 56%, 35%) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-4 text-4xl">🪷</div>
          <div className="absolute top-1 right-4 text-3xl">🕉️</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl">🪔</div>
          <div className="absolute bottom-3 right-6 text-2xl">📿</div>
          <div className="absolute top-1/2 left-8 text-xl">✨</div>
        </div>

        <div className="flex justify-center gap-1 pt-2 text-lg opacity-70">
          🥭🍃🥭🍃🥭🍃🥭🍃🥭
        </div>

        <div className="relative px-5 py-4 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <p className="text-white/80 text-xs font-medium tracking-widest uppercase mb-1">
              Happy Ugadi 2026
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-white leading-tight mb-1">
              ఉగాది శుభాకాంక్షలు! 🙏
            </h2>
            <p className="text-white/90 font-heading text-base font-semibold">
              పరాభవ నామ సంవత్సరం
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] text-white font-medium">
              🗓️ Telugu New Year
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] text-white font-medium">
              🪔 Chaitra Shudha Padyami
            </span>
          </div>

          <p className="text-white/75 text-[11px] leading-relaxed mt-3 max-w-[300px] mx-auto">
            Ugadi marks the beginning of a new Hindu lunar calendar year. 
            "యుగ + ఆది" means "beginning of a new age". Celebrate with Ugadi Pachadi 🍯 and special prayers!
          </p>
        </div>
      </motion.div>

      {/* Ugadi Mantras Section */}
      {ugadiMantras && ugadiMantras.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl sm:text-2xl text-foreground flex items-center gap-2">
              🪔 Ugadi Mantras
            </h2>
          </div>
          <StaggerContainer className="space-y-3">
            {ugadiMantras.map((m) => (
              <StaggerItem key={m.id}>
                <MantraCard mantra={m} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </div>
  );
};
