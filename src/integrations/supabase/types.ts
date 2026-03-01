export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          mantra_count: number
          name_en: string
          name_te: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          mantra_count?: number
          name_en: string
          name_te: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          mantra_count?: number
          name_en?: string
          name_te?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      deities: {
        Row: {
          created_at: string
          description_en: string | null
          description_te: string | null
          icon: string
          id: string
          image_url: string | null
          name_en: string
          name_te: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_te?: string | null
          icon?: string
          id?: string
          image_url?: string | null
          name_en: string
          name_te: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_te?: string | null
          icon?: string
          id?: string
          image_url?: string | null
          name_en?: string
          name_te?: string
        }
        Relationships: []
      }
      mantra_verses: {
        Row: {
          created_at: string
          id: string
          mantra_id: string
          meaning_en: string | null
          meaning_te: string | null
          telugu: string
          transliteration: string | null
          verse_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          mantra_id: string
          meaning_en?: string | null
          meaning_te?: string | null
          telugu: string
          transliteration?: string | null
          verse_number: number
        }
        Update: {
          created_at?: string
          id?: string
          mantra_id?: string
          meaning_en?: string | null
          meaning_te?: string | null
          telugu?: string
          transliteration?: string | null
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "mantra_verses_mantra_id_fkey"
            columns: ["mantra_id"]
            isOneToOne: false
            referencedRelation: "mantras"
            referencedColumns: ["id"]
          },
        ]
      }
      mantras: {
        Row: {
          benefits: Json | null
          benefits_te: Json | null
          category_id: string | null
          chant_count: number | null
          created_at: string
          deity_id: string | null
          id: string
          is_published: boolean
          meaning_en: string
          meaning_te: string | null
          slug: string
          sort_order: number
          source_ref: string | null
          tags: string[] | null
          telugu_text: string
          title_en: string
          title_te: string
          transliteration: string
          updated_at: string
          when_to_chant: string | null
          when_to_chant_te: string | null
        }
        Insert: {
          benefits?: Json | null
          benefits_te?: Json | null
          category_id?: string | null
          chant_count?: number | null
          created_at?: string
          deity_id?: string | null
          id?: string
          is_published?: boolean
          meaning_en: string
          meaning_te?: string | null
          slug: string
          sort_order?: number
          source_ref?: string | null
          tags?: string[] | null
          telugu_text: string
          title_en: string
          title_te: string
          transliteration: string
          updated_at?: string
          when_to_chant?: string | null
          when_to_chant_te?: string | null
        }
        Update: {
          benefits?: Json | null
          benefits_te?: Json | null
          category_id?: string | null
          chant_count?: number | null
          created_at?: string
          deity_id?: string | null
          id?: string
          is_published?: boolean
          meaning_en?: string
          meaning_te?: string | null
          slug?: string
          sort_order?: number
          source_ref?: string | null
          tags?: string[] | null
          telugu_text?: string
          title_en?: string
          title_te?: string
          transliteration?: string
          updated_at?: string
          when_to_chant?: string | null
          when_to_chant_te?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mantras_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mantras_deity_id_fkey"
            columns: ["deity_id"]
            isOneToOne: false
            referencedRelation: "deities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
