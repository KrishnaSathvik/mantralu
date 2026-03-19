import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RashiPhalalu {
  id: string;
  rashi_name_te: string;
  rashi_name_en: string;
  rashi_icon: string;
  prediction_te: string;
  prediction_en: string | null;
  remedies_te: string | null;
  sort_order: number;
  aadayam: number | null;
  vyayam: number | null;
  rajapujyam: number | null;
  avamanam: number | null;
}

function useRashiPhalalu() {
  return useQuery({
    queryKey: ["rashi-phalalu", "parabhava"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rashi_phalalu")
        .select("*")
        .eq("samvatsaram", "పరాభవ")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as RashiPhalalu[];
    },
  });
}

const UGADI_DATE = new Date("2026-03-19");
const SHOW_UNTIL = new Date("2026-03-26"); // 1 week

export function RashiPhalaluSection({ forceShow = false }: { forceShow?: boolean }) {
  const today = new Date();
  const { data: rashis, isLoading } = useRashiPhalalu();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Show on home page only for 1 week; always show if forceShow (settings/search)
  if (!forceShow && (today < UGADI_DATE || today > SHOW_UNTIL)) return null;
  if (isLoading || !rashis?.length) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl sm:text-2xl text-foreground">
          రాశి ఫలాలు
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium bg-secondary rounded-full px-2 py-0.5">
          పరాభవ 2026-27
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Tap your rashi to see this year's predictions
      </p>

      <div className="grid grid-cols-3 gap-2">
        {rashis.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <div key={r.id} className={isExpanded ? "col-span-3" : ""}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
                className={`w-full text-left rounded-xl border transition-all ${
                  isExpanded
                    ? "bg-primary/5 border-primary/30 p-4"
                    : "bg-card p-3 hover:bg-secondary/50 hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.rashi_icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm text-foreground leading-tight truncate">
                      {r.rashi_name_te}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {r.rashi_name_en}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : null}
                </div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 space-y-3">
                      <div>
                        <p className="font-telugu text-[13px] text-foreground leading-relaxed">
                          {r.prediction_te}
                        </p>
                        {r.prediction_en && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">
                            {r.prediction_en}
                          </p>
                        )}
                      </div>
                      {r.remedies_te && (
                        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                          <p className="text-[11px] font-semibold text-primary mb-1">
                            🙏 శాంతి పరిహారాలు (Remedies)
                          </p>
                          <p className="font-telugu text-xs text-foreground/80 leading-relaxed">
                            {r.remedies_te}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/60 mt-3 text-center italic">
        Source: పంచాంగ శ్రవణం — జల్లవరపు సాయి ధీరజ్ శర్మ, జ్యోతిష పండితులు
      </p>
    </section>
  );
}
