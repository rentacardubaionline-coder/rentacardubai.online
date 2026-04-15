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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          address_line: string | null
          city: string
          claim_status: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          google_maps_url: string | null
          google_place_id: string | null
          id: string
          languages: string[] | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          rating: number | null
          reviews_count: number | null
          slug: string
          total_fleet_count: number | null
          updated_at: string | null
          whatsapp_phone: string | null
          working_hours: Json | null
        }
        Insert: {
          address_line?: string | null
          city: string
          claim_status?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          google_maps_url?: string | null
          google_place_id?: string | null
          id?: string
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          rating?: number | null
          reviews_count?: number | null
          slug: string
          total_fleet_count?: number | null
          updated_at?: string | null
          whatsapp_phone?: string | null
          working_hours?: Json | null
        }
        Update: {
          address_line?: string | null
          city?: string
          claim_status?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          google_maps_url?: string | null
          google_place_id?: string | null
          id?: string
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          rating?: number | null
          reviews_count?: number | null
          slug?: string
          total_fleet_count?: number | null
          updated_at?: string | null
          whatsapp_phone?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_images: {
        Row: {
          business_id: string
          cloudinary_public_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          sort_order: number | null
          url: string
        }
        Insert: {
          business_id: string
          cloudinary_public_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          sort_order?: number | null
          url: string
        }
        Update: {
          business_id?: string
          cloudinary_public_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewer_avatar_url: string | null
          reviewer_name: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewer_avatar_url?: string | null
          reviewer_name: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewer_avatar_url?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_features: {
        Row: {
          created_at: string | null
          feature_id: string
          listing_id: string
        }
        Insert: {
          created_at?: string | null
          feature_id: string
          listing_id: string
        }
        Update: {
          created_at?: string | null
          feature_id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "vehicle_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          listing_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          listing_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          listing_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_modes: {
        Row: {
          created_at: string | null
          listing_id: string
          mode: string
          surcharge_pkr: number | null
        }
        Insert: {
          created_at?: string | null
          listing_id: string
          mode: string
          surcharge_pkr?: number | null
        }
        Update: {
          created_at?: string | null
          listing_id?: string
          mode?: string
          surcharge_pkr?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_modes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_policies: {
        Row: {
          cancellation_text: string | null
          created_at: string | null
          delivery_available: boolean | null
          delivery_fee_pkr: number | null
          deposit_pkr: number | null
          license_required: boolean | null
          listing_id: string
          min_age: number | null
          updated_at: string | null
        }
        Insert: {
          cancellation_text?: string | null
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_fee_pkr?: number | null
          deposit_pkr?: number | null
          license_required?: boolean | null
          listing_id: string
          min_age?: number | null
          updated_at?: string | null
        }
        Update: {
          cancellation_text?: string | null
          created_at?: string | null
          delivery_available?: boolean | null
          delivery_fee_pkr?: number | null
          deposit_pkr?: number | null
          license_required?: boolean | null
          listing_id?: string
          min_age?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_policies_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_pricing: {
        Row: {
          created_at: string | null
          extra_km_rate_pkr: number | null
          id: string
          included_km_per_day: number | null
          listing_id: string
          min_hours: number | null
          price_pkr: number
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extra_km_rate_pkr?: number | null
          id?: string
          included_km_per_day?: number | null
          listing_id: string
          min_hours?: number | null
          price_pkr: number
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extra_km_rate_pkr?: number | null
          id?: string
          included_km_per_day?: number | null
          listing_id?: string
          min_hours?: number | null
          price_pkr?: number
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_pricing_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          business_id: string
          city: string
          color: string | null
          created_at: string | null
          description: string | null
          fuel: string | null
          id: string
          mileage_km: number | null
          model_id: string | null
          primary_image_url: string | null
          published_at: string | null
          rejection_reason: string | null
          seats: number | null
          slug: string
          status: string | null
          title: string
          transmission: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          business_id: string
          city: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          fuel?: string | null
          id?: string
          mileage_km?: number | null
          model_id?: string | null
          primary_image_url?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          seats?: number | null
          slug: string
          status?: string | null
          title: string
          transmission?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          business_id?: string
          city?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          fuel?: string | null
          id?: string
          mileage_km?: number | null
          model_id?: string | null
          primary_image_url?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          seats?: number | null
          slug?: string
          status?: string | null
          title?: string
          transmission?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      makes: {
        Row: {
          created_at: string | null
          external_id: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          body_type: string | null
          created_at: string | null
          external_id: string | null
          id: string
          make_id: string
          name: string
          slug: string
        }
        Insert: {
          body_type?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          make_id: string
          name: string
          slug: string
        }
        Update: {
          body_type?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          make_id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "makes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_mode: Database["public"]["Enums"]["active_mode"] | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_vendor: boolean
          lead_rate_pkr: number | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          active_mode?: Database["public"]["Enums"]["active_mode"] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_vendor?: boolean
          lead_rate_pkr?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          active_mode?: Database["public"]["Enums"]["active_mode"] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_vendor?: boolean
          lead_rate_pkr?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_features: {
        Row: {
          created_at: string | null
          external_id: string | null
          group: string | null
          icon_url: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          group?: string | null
          icon_url?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          group?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_vendor: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      active_mode: "customer" | "vendor"
      user_role: "customer" | "vendor" | "admin"
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
      active_mode: ["customer", "vendor"],
      user_role: ["customer", "vendor", "admin"],
    },
  },
} as const
