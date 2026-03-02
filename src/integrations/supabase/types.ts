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
      app_users: {
        Row: {
          created_at: string
          device_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      chat_conversations: {
        Row: {
          created_at: string
          device_id: string
          id: string
          messages: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
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
      device_tokens: {
        Row: {
          created_at: string
          device_id: string
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          token: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          device_id: string
          id: string
          message: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          message: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          message?: string
          user_name?: string | null
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
      page_views: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          device_id: string
          id: string
          rating: number
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          device_id: string
          id?: string
          rating: number
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          device_id?: string
          id?: string
          rating?: number
          user_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_device_id_from_token: { Args: { _token: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      requesting_device_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
