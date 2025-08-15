export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ad_views: {
        Row: {
          ad_type: string
          ad_unit_id: string | null
          completed: boolean | null
          created_at: string
          id: string
          reward_granted: boolean | null
          user_id: string | null
        }
        Insert: {
          ad_type: string
          ad_unit_id?: string | null
          completed?: boolean | null
          created_at?: string
          id?: string
          reward_granted?: boolean | null
          user_id?: string | null
        }
        Update: {
          ad_type?: string
          ad_unit_id?: string | null
          completed?: boolean | null
          created_at?: string
          id?: string
          reward_granted?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          role?: string
        }
        Relationships: []
      }
      likes_revealed: {
        Row: {
          created_at: string
          id: string
          liker_id: string
          revealed_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liker_id: string
          revealed_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liker_id?: string
          revealed_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_revealed_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      premium_features: {
        Row: {
          created_at: string
          expires_at: string | null
          feature_type: string
          id: string
          is_active: boolean | null
          quantity: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          feature_type: string
          id?: string
          is_active?: boolean | null
          quantity?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          feature_type?: string
          id?: string
          is_active?: boolean | null
          quantity?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profile_boosts: {
        Row: {
          boost_type: string
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          boost_type: string
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          boost_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          additional_photos: string[] | null
          age: number
          animals: string
          bio: string | null
          body_type: string | null
          children: string
          created_at: string
          drinks: string | null
          education: string | null
          email: string
          ethnicity: string | null
          exercise_frequency: string | null
          face_verification_data: Json | null
          first_name: string
          gender: string
          has_pets: boolean | null
          height: number | null
          id: string
          instagram_handle: string | null
          interests: string[] | null
          is_profile_complete: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          last_active: string | null
          looking_for: string
          max_distance: number | null
          pets_description: string | null
          phone_number: string | null
          politics: string | null
          profession: string | null
          profile_photo_url: string
          relationship_status: string | null
          relationship_type: string
          religion: string | null
          smoker: boolean
          spotify_anthem: string | null
          updated_at: string
          user_id: string
          wants_kids: string | null
          weight: number | null
          zodiac_sign: string | null
        }
        Insert: {
          additional_photos?: string[] | null
          age: number
          animals: string
          bio?: string | null
          body_type?: string | null
          children: string
          created_at?: string
          drinks?: string | null
          education?: string | null
          email: string
          ethnicity?: string | null
          exercise_frequency?: string | null
          face_verification_data?: Json | null
          first_name: string
          gender: string
          has_pets?: boolean | null
          height?: number | null
          id?: string
          instagram_handle?: string | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          looking_for: string
          max_distance?: number | null
          pets_description?: string | null
          phone_number?: string | null
          politics?: string | null
          profession?: string | null
          profile_photo_url?: string
          relationship_status?: string | null
          relationship_type: string
          religion?: string | null
          smoker?: boolean
          spotify_anthem?: string | null
          updated_at?: string
          user_id: string
          wants_kids?: string | null
          weight?: number | null
          zodiac_sign?: string | null
        }
        Update: {
          additional_photos?: string[] | null
          age?: number
          animals?: string
          bio?: string | null
          body_type?: string | null
          children?: string
          created_at?: string
          drinks?: string | null
          education?: string | null
          email?: string
          ethnicity?: string | null
          exercise_frequency?: string | null
          face_verification_data?: Json | null
          first_name?: string
          gender?: string
          has_pets?: boolean | null
          height?: number | null
          id?: string
          instagram_handle?: string | null
          interests?: string[] | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          looking_for?: string
          max_distance?: number | null
          pets_description?: string | null
          phone_number?: string | null
          politics?: string | null
          profession?: string | null
          profile_photo_url?: string
          relationship_status?: string | null
          relationship_type?: string
          religion?: string | null
          smoker?: boolean
          spotify_anthem?: string | null
          updated_at?: string
          user_id?: string
          wants_kids?: string | null
          weight?: number | null
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          id: string
          is_like: boolean
          is_super_like: boolean | null
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_like: boolean
          is_super_like?: boolean | null
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_like?: boolean
          is_super_like?: boolean | null
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          feature: string
          id: string
          payment_method: string | null
          payment_provider_id: string | null
          plan: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          feature: string
          id?: string
          payment_method?: string | null
          payment_provider_id?: string | null
          plan: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          feature?: string
          id?: string
          payment_method?: string | null
          payment_provider_id?: string | null
          plan?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_profile: {
        Args: { profile_user_id: string; viewer_id: string }
        Returns: boolean
      }
      create_user_profile: {
        Args: {
          user_id: string
          email: string
          first_name: string
          age: number
          gender: string
          looking_for: string
          relationship_type: string
          smoker: boolean
          animals: string
          children: string
          profile_photo_url: string
          max_distance: number
          is_profile_complete: boolean
        }
        Returns: string
      }
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
