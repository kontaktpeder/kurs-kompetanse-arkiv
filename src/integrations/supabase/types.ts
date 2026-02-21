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
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_runs: {
        Row: {
          client_label: string | null
          course_id: string
          created_at: string
          date_end: string | null
          date_label: string | null
          date_start: string | null
          id: string
          instructor_id: string | null
          is_featured: boolean
          is_published: boolean
          location_text: string | null
          media: Json
          notes: string | null
          participants_count: number | null
          passed_count: number | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          client_label?: string | null
          course_id: string
          created_at?: string
          date_end?: string | null
          date_label?: string | null
          date_start?: string | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean
          is_published?: boolean
          location_text?: string | null
          media?: Json
          notes?: string | null
          participants_count?: number | null
          passed_count?: number | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          client_label?: string | null
          course_id?: string
          created_at?: string
          date_end?: string | null
          date_label?: string | null
          date_start?: string | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean
          is_published?: boolean
          location_text?: string | null
          media?: Json
          notes?: string | null
          participants_count?: number | null
          passed_count?: number | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_runs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_runs_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certification_info: string | null
          course_structure: string | null
          course_type: Database["public"]["Enums"]["course_type"]
          created_at: string
          description: string | null
          duration: string | null
          hero_image_url: string | null
          icon_key: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          languages: string[]
          learning_outcomes: string | null
          offer_body: string | null
          offer_expires_at: string | null
          offer_is_active: boolean
          offer_title: string | null
          practical_info: string | null
          requirements: string | null
          short_description: string | null
          slug: string
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          certification_info?: string | null
          course_structure?: string | null
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string
          description?: string | null
          duration?: string | null
          hero_image_url?: string | null
          icon_key?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          languages?: string[]
          learning_outcomes?: string | null
          offer_body?: string | null
          offer_expires_at?: string | null
          offer_is_active?: boolean
          offer_title?: string | null
          practical_info?: string | null
          requirements?: string | null
          short_description?: string | null
          slug: string
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          certification_info?: string | null
          course_structure?: string | null
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string
          description?: string | null
          duration?: string | null
          hero_image_url?: string | null
          icon_key?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          languages?: string[]
          learning_outcomes?: string | null
          offer_body?: string | null
          offer_expires_at?: string | null
          offer_is_active?: boolean
          offer_title?: string | null
          practical_info?: string | null
          requirements?: string | null
          short_description?: string | null
          slug?: string
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      instructors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          is_active: boolean
          languages: string[]
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          course_id: string | null
          created_at: string
          desired_timeframe: string | null
          email: string | null
          id: string
          language_preference: string | null
          location_text: string | null
          message: string | null
          name: string
          participants_estimate: number | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          company?: string | null
          course_id?: string | null
          created_at?: string
          desired_timeframe?: string | null
          email?: string | null
          id?: string
          language_preference?: string | null
          location_text?: string | null
          message?: string | null
          name: string
          participants_estimate?: number | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          company?: string | null
          course_id?: string | null
          created_at?: string
          desired_timeframe?: string | null
          email?: string | null
          id?: string
          language_preference?: string | null
          location_text?: string | null
          message?: string | null
          name?: string
          participants_estimate?: number | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          company: string | null
          course_run_id: string
          created_at: string
          display_name: string | null
          id: string
          is_approved: boolean
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          company?: string | null
          course_run_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_approved?: boolean
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          company?: string | null
          course_run_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_approved?: boolean
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_run_id_fkey"
            columns: ["course_run_id"]
            isOneToOne: false
            referencedRelation: "course_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          home_hero_cta_primary_href: string | null
          home_hero_cta_primary_label: string | null
          home_hero_cta_secondary_href: string | null
          home_hero_cta_secondary_label: string | null
          home_hero_image_url: string | null
          home_hero_subtitle: string | null
          home_hero_title: string | null
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          home_hero_cta_primary_href?: string | null
          home_hero_cta_primary_label?: string | null
          home_hero_cta_secondary_href?: string | null
          home_hero_cta_secondary_label?: string | null
          home_hero_image_url?: string | null
          home_hero_subtitle?: string | null
          home_hero_title?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          home_hero_cta_primary_href?: string | null
          home_hero_cta_primary_label?: string | null
          home_hero_cta_secondary_href?: string | null
          home_hero_cta_secondary_label?: string | null
          home_hero_image_url?: string | null
          home_hero_subtitle?: string | null
          home_hero_title?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_valid_languages: { Args: { lang: string[] }; Returns: boolean }
      is_valid_slug: { Args: { s: string }; Returns: boolean }
    }
    Enums: {
      course_type: "certified" | "documented" | "other"
      lead_status: "new" | "contacted" | "offered" | "booked" | "done" | "lost"
      media_type: "image" | "video"
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
      course_type: ["certified", "documented", "other"],
      lead_status: ["new", "contacted", "offered", "booked", "done", "lost"],
      media_type: ["image", "video"],
    },
  },
} as const
