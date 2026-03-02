import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId, ensureDeviceToken } from "@/lib/device";

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const trackView = async () => {
      try {
        await ensureDeviceToken();
        await supabase.from("page_views").insert({
          device_id: getDeviceId(),
          page_path: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch {
        // Silent fail — analytics should never break the app
      }
    };

    trackView();
  }, [location.pathname]);
}
