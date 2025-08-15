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
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "likes_revealed_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "likes_revealed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "likes_revealed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
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
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
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
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_profiles"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
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
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
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
      compatible_profiles_view: {
        Row: {
          age: number | null
          bio: string | null
          current_user_gender: string | null
          current_user_id: string | null
          current_user_looking_for: string | null
          first_name: string | null
          gender: string | null
          is_profile_complete: boolean | null
          last_active: string | null
          profile_id: string | null
          profile_photo_url: string | null
          user_id: string | null
        }
        Relationships: []
      }
      matches_with_profiles: {
        Row: {
          match_created_at: string | null
          match_id: string | null
          user1_age: number | null
          user1_gender: string | null
          user1_id: string | null
          user1_name: string | null
          user1_photo: string | null
          user2_age: number | null
          user2_gender: string | null
          user2_id: string | null
          user2_name: string | null
          user2_photo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages_with_sender: {
        Row: {
          content: string | null
          created_at: string | null
          is_read: boolean | null
          match_id: string | null
          message_id: string | null
          sender_id: string | null
          sender_name: string | null
          sender_photo: string | null
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
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches_with_profiles"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      recent_user_activity: {
        Row: {
          first_name: string | null
          last_active: string | null
          matches_last_7_days: number | null
          messages_last_7_days: number | null
          swipes_last_7_days: number | null
          user_id: string | null
        }
        Relationships: []
      }
      swipes_with_profiles: {
        Row: {
          is_like: boolean | null
          is_super_like: boolean | null
          swipe_created_at: string | null
          swipe_id: string | null
          swiped_age: number | null
          swiped_gender: string | null
          swiped_id: string | null
          swiped_name: string | null
          swiped_photo: string | null
          swiper_id: string | null
          swiper_name: string | null
          swiper_photo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["current_user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "compatible_profiles_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "recent_user_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "user_detailed_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_detailed_stats: {
        Row: {
          email: string | null
          first_name: string | null
          is_profile_complete: boolean | null
          last_active: string | null
          like_rate_percentage: number | null
          profile_created_at: string | null
          total_likes: number | null
          total_matches: number | null
          total_messages: number | null
          total_super_likes: number | null
          total_swipes: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_profile: {
        Args: { profile_user_id: string; viewer_id: string }
        Returns: boolean
      }
      check_data_integrity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_match_status: {
        Args: { p_swiped_id: string; p_swiper_id: string }
        Returns: Json
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_user_profile: {
        Args: {
          age: number
          animals: string
          children: string
          email: string
          first_name: string
          gender: string
          is_profile_complete: boolean
          looking_for: string
          max_distance: number
          profile_photo_url: string
          relationship_type: string
          smoker: boolean
          user_id: string
        }
        Returns: string
      }
      get_compatible_profiles: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          age: number
          bio: string
          compatibility_score: number
          distance_km: number
          first_name: string
          gender: string
          profile_id: string
          profile_photo_url: string
          user_id: string
        }[]
      }
      get_database_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      perform_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_email: {
        Args: { email: string }
        Returns: boolean
      }
      validate_photo_url: {
        Args: { url: string }
        Returns: boolean
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
