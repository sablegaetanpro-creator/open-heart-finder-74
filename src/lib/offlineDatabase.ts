import Dexie, { Table } from 'dexie';

// Local database interfaces
export interface LocalProfile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  gender: string;
  looking_for: string;
  profile_photo_url: string;
  additional_photos?: string[];
  bio?: string;
  profession?: string;
  interests?: string[];
  height?: number;
  education?: string;
  exercise_frequency?: string;
  children?: string;
  animals?: string;
  smoker?: boolean;
  drinks?: string;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  last_synced?: string;
  is_dirty?: boolean; // Needs sync
}

export interface LocalSwipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  is_like: boolean;
  is_super_like?: boolean;
  created_at: string;
  last_synced?: string;
  is_dirty?: boolean;
}

export interface LocalMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  is_active: boolean;
  created_at: string;
  last_synced?: string;
  is_dirty?: boolean;
}

export interface LocalMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  message_type?: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
  last_synced?: string;
  is_dirty?: boolean;
}

export interface LocalUserPurchase {
  id: string;
  user_id: string;
  feature: string;
  plan: string;
  amount: number;
  status: string;
  payment_method?: string;
  expires_at?: string;
  created_at: string;
  last_synced?: string;
  is_dirty?: boolean;
}

export interface LocalPremiumFeature {
  id: string;
  user_id: string;
  feature_type: string;
  quantity?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  last_synced?: string;
  is_dirty?: boolean;
}

export interface SyncMeta {
  table_name: string;
  last_sync: string;
  version: number;
}

class OfflineDatabase extends Dexie {
  profiles!: Table<LocalProfile>;
  swipes!: Table<LocalSwipe>;
  matches!: Table<LocalMatch>;
  messages!: Table<LocalMessage>;
  user_purchases!: Table<LocalUserPurchase>;
  premium_features!: Table<LocalPremiumFeature>;
  sync_meta!: Table<SyncMeta>;

  constructor() {
    super('OpenHeartFinderDB');
    this.version(1).stores({
      profiles: '++id, user_id, first_name, age, gender, looking_for, is_profile_complete, last_synced, is_dirty',
      swipes: '++id, swiper_id, swiped_id, is_like, created_at, last_synced, is_dirty',
      matches: '++id, user1_id, user2_id, is_active, created_at, last_synced, is_dirty',
      messages: '++id, match_id, sender_id, created_at, is_read, last_synced, is_dirty',
      user_purchases: '++id, user_id, feature, status, created_at, last_synced, is_dirty',
      premium_features: '++id, user_id, feature_type, is_active, expires_at, last_synced, is_dirty',
      sync_meta: '++table_name, last_sync, version'
    });
  }
}

export const offlineDb = new OfflineDatabase();