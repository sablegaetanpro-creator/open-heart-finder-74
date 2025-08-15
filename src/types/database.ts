export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  looking_for: 'homme' | 'femme' | 'les_deux';
  relationship_type: 'amitie' | 'relation_serieuse' | 'relation_casuelle' | 'mariage';
  smoker: boolean;
  animals: string;
  children: string;
  profile_photo_url: string;
  additional_photos?: string[];
  bio?: string;
  location?: string;
  max_distance: number;
  interests?: string[];
  languages?: string[];
  height?: number;
  weight?: number;
  profession?: string;
  education?: string;
  exercise_frequency?: string;
  drinks?: string;
  has_pets?: boolean;
  pets_description?: string;
  relationship_status?: string;
  wants_kids?: string;
  body_type?: string;
  ethnicity?: string;
  religion?: string;
  politics?: string;
  zodiac_sign?: string;
  phone_number?: string;
  instagram_handle?: string;
  spotify_anthem?: string;
  is_verified?: boolean;
  is_profile_complete: boolean;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface FilterOptions {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  gender?: string;
  relationshipType?: string;
  smoker?: boolean;
  animals?: string;
  children?: string;
  height?: [number, number];
  bodyType?: string[];
  education?: string[];
  drinks?: string[];
  exercise?: string[];
  religion?: string;
  politics?: string;
  profession?: string[];
  interests?: string[];
}

export interface Swipe {
  id: string;
  user_id: string;
  swiped_id: string;
  is_like: boolean;
  is_super_like: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio';
  is_read: boolean;
  created_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  feature: 'premium' | 'super_likes' | 'boost' | 'reveal_likes';
  plan: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: 'card' | 'paypal' | 'mobile';
  payment_provider_id?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PremiumFeature {
  id: string;
  user_id: string;
  feature_type: 'premium' | 'super_likes' | 'boost';
  quantity: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdView {
  id: string;
  user_id: string;
  ad_type: 'banner' | 'interstitial' | 'rewarded';
  ad_unit_id?: string;
  completed: boolean;
  reward_granted: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      swipes: {
        Row: Swipe;
        Insert: Omit<Swipe, 'id' | 'created_at'>;
        Update: Partial<Omit<Swipe, 'id' | 'created_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      user_purchases: {
        Row: UserPurchase;
        Insert: Omit<UserPurchase, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPurchase, 'id' | 'created_at' | 'updated_at'>>;
      };
      premium_features: {
        Row: PremiumFeature;
        Insert: Omit<PremiumFeature, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PremiumFeature, 'id' | 'created_at' | 'updated_at'>>;
      };
      ad_views: {
        Row: AdView;
        Insert: Omit<AdView, 'id' | 'created_at'>;
        Update: Partial<Omit<AdView, 'id' | 'created_at'>>;
      };
    };
  };
}