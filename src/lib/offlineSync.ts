import { Network } from '@capacitor/network';
import { supabase } from '@/integrations/supabase/client';
import { offlineDb, LocalProfile, LocalSwipe, LocalMatch, LocalMessage } from './offlineDatabase';

export interface SyncResult {
  success: boolean;
  error?: string;
  synced_tables: string[];
  total_records: number;
}

class OfflineSyncManager {
  private isOnline = true;
  private syncInProgress = false;
  private syncCallbacks: (() => void)[] = [];

  constructor() {
    this.initializeNetworkListener();
  }

  private async initializeNetworkListener() {
    // Check initial network status
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      const wasOffline = !this.isOnline;
      this.isOnline = status.connected;
      
      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        this.triggerAutoSync();
      }
    });
  }

  public async getNetworkStatus(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const status = await Network.getStatus();
      return status.connected;
    }
    return navigator.onLine;
  }

  public onSyncComplete(callback: () => void) {
    this.syncCallbacks.push(callback);
  }

  private triggerSyncCallbacks() {
    this.syncCallbacks.forEach(callback => callback());
  }

  private async triggerAutoSync() {
    if (!this.syncInProgress && this.isOnline) {
      try {
        await this.performFullSync();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  }

  public async performFullSync(userId?: string): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress', synced_tables: [], total_records: 0 };
    }

    if (!await this.getNetworkStatus()) {
      return { success: false, error: 'No network connection', synced_tables: [], total_records: 0 };
    }

    this.syncInProgress = true;
    const syncedTables: string[] = [];
    let totalRecords = 0;

    try {
      // 1. Upload local changes (dirty records)
      await this.uploadDirtyRecords(userId);

      // 2. Download remote changes
      // Check if this is first sync (no profiles in local DB)
      const localProfilesCount = await offlineDb.profiles.count();
      const isFirstSync = localProfilesCount === 0;
      console.log('🔍 Première synchronisation:', isFirstSync, 'Profils locaux:', localProfilesCount);
      
      const profilesCount = await this.syncProfiles(userId, isFirstSync);
      if (profilesCount > 0) {
        syncedTables.push('profiles');
        totalRecords += profilesCount;
      }

      const swipesCount = await this.syncSwipes(userId);
      if (swipesCount > 0) {
        syncedTables.push('swipes');
        totalRecords += swipesCount;
      }

      const matchesCount = await this.syncMatches(userId);
      if (matchesCount > 0) {
        syncedTables.push('matches');
        totalRecords += matchesCount;
      }

      const messagesCount = await this.syncMessages(userId);
      if (messagesCount > 0) {
        syncedTables.push('messages');
        totalRecords += messagesCount;
      }

      // 3. Update sync metadata
      await this.updateSyncMeta();

      this.triggerSyncCallbacks();

      return {
        success: true,
        synced_tables: syncedTables,
        total_records: totalRecords
      };

    } catch (error: any) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown sync error',
        synced_tables: syncedTables,
        total_records: totalRecords
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async uploadDirtyRecords(userId?: string) {
    // Upload dirty swipes - use filter instead of equals for boolean
    const allSwipes = await offlineDb.swipes.toArray();
    const dirtySwipes = allSwipes.filter(swipe => swipe.is_dirty === true);
    console.log('📤 Upload dirty swipes:', dirtySwipes.length);
    
    for (const swipe of dirtySwipes) {
      try {
        const { error } = await supabase
          .from('swipes')
          .upsert({
            id: swipe.id,
            swiper_id: swipe.swiper_id,
            swiped_id: swipe.swiped_id,
            is_like: swipe.is_like,
            is_super_like: swipe.is_super_like || false,
            created_at: swipe.created_at
          });

        if (!error) {
          // Mark as synced
          await offlineDb.swipes.update(swipe.id, {
            is_dirty: false,
            last_synced: new Date().toISOString()
          });
          console.log('✅ Swipe synchronisé:', swipe.id);
        } else {
          console.error('❌ Erreur sync swipe:', error);
        }
      } catch (error) {
        console.error('Failed to sync swipe:', error);
      }
    }

    // Upload dirty messages - use filter instead of equals for boolean
    const allMessages = await offlineDb.messages.toArray();
    const dirtyMessages = allMessages.filter(message => message.is_dirty === true);
    console.log('📤 Upload dirty messages:', dirtyMessages.length);
    
    for (const message of dirtyMessages) {
      try {
        const { error } = await supabase
          .from('messages')
          .upsert({
            id: message.id,
            match_id: message.match_id,
            sender_id: message.sender_id,
            content: message.content,
            is_read: message.is_read,
            created_at: message.created_at
          });

        if (!error) {
          await offlineDb.messages.update(message.id, {
            is_dirty: false,
            last_synced: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to sync message:', error);
      }
    }
  }

  private async syncProfiles(userId?: string, forceFullSync: boolean = false): Promise<number> {
    const lastSync = forceFullSync ? '1970-01-01T00:00:00.000Z' : await this.getLastSync('profiles');
    console.log('🔄 Synchronisation profils - lastSync:', lastSync, 'forceFullSync:', forceFullSync);
    
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_profile_complete', true);

    // Only apply time filter if not forcing full sync and not first sync
    if (!forceFullSync && lastSync !== '1970-01-01T00:00:00.000Z') {
      query = query.gte('updated_at', lastSync);
    }

    const { data, error } = await query.limit(200);
    console.log('📊 Profils récupérés depuis Supabase:', data?.length || 0);
    
    if (error) {
      console.error('❌ Erreur synchronisation profils:', error);
      throw error;
    }
    if (!data || data.length === 0) return 0;

    // Store in local database
    const profiles: LocalProfile[] = data.map(profile => ({
      ...profile,
      last_synced: new Date().toISOString(),
      is_dirty: false
    }));

    await offlineDb.profiles.bulkPut(profiles);
    console.log('✅ Profils sauvegardés en local:', profiles.length);
    return profiles.length;
  }

  private async syncSwipes(userId?: string): Promise<number> {
    if (!userId) return 0;
    
    const lastSync = await this.getLastSync('swipes');
    
    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .eq('swiper_id', userId)
      .gte('created_at', lastSync)
      .limit(100);
    
    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const swipes: LocalSwipe[] = data.map(swipe => ({
      ...swipe,
      last_synced: new Date().toISOString(),
      is_dirty: false
    }));

    await offlineDb.swipes.bulkPut(swipes);
    return swipes.length;
  }

  private async syncMatches(userId?: string): Promise<number> {
    if (!userId) return 0;
    
    const lastSync = await this.getLastSync('matches');
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .gte('created_at', lastSync)
      .limit(100);
    
    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const matches: LocalMatch[] = data.map(match => ({
      ...match,
      last_synced: new Date().toISOString(),
      is_dirty: false
    }));

    await offlineDb.matches.bulkPut(matches);
    return matches.length;
  }

  private async syncMessages(userId?: string): Promise<number> {
    if (!userId) return 0;
    
    const lastSync = await this.getLastSync('messages');
    
    // Get user's matches first
    const userMatches = await offlineDb.matches
      .where('user1_id').equals(userId)
      .or('user2_id').equals(userId)
      .toArray();

    if (userMatches.length === 0) return 0;

    const matchIds = userMatches.map(m => m.id);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('match_id', matchIds)
      .gte('created_at', lastSync)
      .limit(200);
    
    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const messages: LocalMessage[] = data.map(message => ({
      ...message,
      last_synced: new Date().toISOString(),
      is_dirty: false
    }));

    await offlineDb.messages.bulkPut(messages);
    return messages.length;
  }

  private async getLastSync(tableName: string): Promise<string> {
    const meta = await offlineDb.sync_meta.where('table_name').equals(tableName).first();
    return meta?.last_sync || '1970-01-01T00:00:00.000Z';
  }

  private async updateSyncMeta() {
    const now = new Date().toISOString();
    const tables = ['profiles', 'swipes', 'matches', 'messages', 'user_purchases', 'premium_features'];
    
    for (const table of tables) {
      await offlineDb.sync_meta.put({
        table_name: table,
        last_sync: now,
        version: 1
      });
    }
  }

  // Public methods for manual sync triggers
  public async forceSyncProfiles(userId: string) {
    return this.syncProfiles(userId, true);
  }

  public async forceFullSync(userId: string): Promise<SyncResult> {
    console.log('🔄 Synchronisation complète forcée...');
    // Clear local data first
    await offlineDb.profiles.clear();
    await offlineDb.sync_meta.clear();
    
    // Then perform full sync
    return this.performFullSync(userId);
  }

  public async getOfflineStats() {
    const [profiles, swipes, matches, messages] = await Promise.all([
      offlineDb.profiles.count(),
      offlineDb.swipes.count(),
      offlineDb.matches.count(),
      offlineDb.messages.count()
    ]);

    return {
      profiles,
      swipes,
      matches,
      messages,
      total: profiles + swipes + matches + messages
    };
  }

  public async clearOfflineData() {
    await Promise.all([
      offlineDb.profiles.clear(),
      offlineDb.swipes.clear(),
      offlineDb.matches.clear(),
      offlineDb.messages.clear(),
      offlineDb.user_purchases.clear(),
      offlineDb.premium_features.clear(),
      offlineDb.sync_meta.clear()
    ]);
  }
}

export const syncManager = new OfflineSyncManager();