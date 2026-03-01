import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface DbMantra {
  id: string;
  slug: string;
  title_en: string;
  title_te: string;
  deity_id: string | null;
  category_id: string | null;
  telugu_text: string;
  transliteration: string;
  meaning_en: string;
  meaning_te: string | null;
  benefits: string[];
  when_to_chant: string | null;
  chant_count: number | null;
  source_ref: string | null;
  tags: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deity?: DbDeity | null;
  category?: DbCategory | null;
}

export interface DbDeity {
  id: string;
  name_en: string;
  name_te: string;
  icon: string;
  description_en: string | null;
  description_te: string | null;
  image_url: string | null;
}

export interface DbCategory {
  id: string;
  name_en: string;
  name_te: string;
  slug: string;
  icon: string;
  sort_order: number;
  mantra_count: number;
}

export function useMantras() {
  return useQuery({
    queryKey: ["mantras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mantras")
        .select("*, deity:deities(*), category:categories(*)")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as DbMantra[];
    },
  });
}

export function useMantraBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["mantra", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("mantras")
        .select("*, deity:deities(*), category:categories(*)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as unknown as DbMantra;
    },
    enabled: !!slug,
  });
}

export function useDeities() {
  return useQuery({
    queryKey: ["deities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deities")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data as DbDeity[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}
