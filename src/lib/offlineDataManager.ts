import { offlineDb, LocalProfile, LocalSwipe, LocalMatch, LocalMessage } from './offlineDatabase';
import { syncManager, SyncResult } from './offlineSync';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export class OfflineDataManager {
  private currentUserId: string | null = null;

  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  // Profile Management
  public async getProfiles(excludeUserIds: string[] = [], limit: number = 50): Promise<LocalProfile[]> {
    console.log('📊 Recherche profils locaux - excludeIds:', excludeUserIds.length);
    
    // Get all profiles and filter for complete ones
    const allProfiles = await offlineDb.profiles.toArray();
    console.log('📊 Total profils en local:', allProfiles.length);
    
    const completeProfiles = allProfiles.filter(profile => 
      (profile.is_profile_complete === true || profile.is_profile_complete as any === 1) &&
      !excludeUserIds.includes(profile.user_id)
    );
    
    console.log('📊 Profils complets filtrés:', completeProfiles.length);
    return completeProfiles.slice(0, limit);
  }

  // Fallback method to load profiles directly from Supabase if local is empty
  public async getProfilesWithFallback(excludeUserIds: string[] = [], limit: number = 50, currentUserProfile?: any): Promise<LocalProfile[]> {
    console.log('🔄 getProfilesWithFallback - début');
    
    // Try local first
    const localProfiles = await this.getProfiles(excludeUserIds, limit);
    
    if (localProfiles.length > 0) {
      console.log('✅ Profils trouvés en local:', localProfiles.length);
      return localProfiles;
    }
    
    // If no local profiles, try direct Supabase fallback
    console.log('🔄 Aucun profil local, chargement direct depuis Supabase...');
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_profile_complete', true);
        
      // Exclude current user and swiped users
      if (excludeUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeUserIds.map(id => `"${id}"`).join(',')})`);
      }
      
      // Apply basic gender compatibility if profile available
      if (currentUserProfile?.looking_for && currentUserProfile.looking_for !== 'les_deux') {
        query = query.eq('gender', currentUserProfile.looking_for);
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error('❌ Erreur chargement Supabase direct:', error);
        return [];
      }
      
      console.log('✅ Profils chargés depuis Supabase:', data?.length || 0);
      
      // Convert to LocalProfile format and optionally store in local DB
      const profiles: LocalProfile[] = (data || []).map(profile => ({
        ...profile,
        last_synced: new Date().toISOString(),
        is_dirty: false
      }));
      
      // Store in local for future use
      if (profiles.length > 0) {
        await offlineDb.profiles.bulkPut(profiles);
        console.log('💾 Profils sauvegardés en local pour cache');
      }
      
      return profiles;
      
    } catch (error) {
      console.error('❌ Erreur fallback Supabase:', error);
      return [];
    }
  }

  public async getProfileByUserId(userId: string): Promise<LocalProfile | undefined> {
    return offlineDb.profiles.where('user_id').equals(userId).first();
  }

  // Swipe Management
  public async createSwipe(swipedUserId: string, isLike: boolean, isSuperLike: boolean = false): Promise<string> {
    if (!this.currentUserId) throw new Error('No current user set');

    const swipeId = uuidv4();
    const now = new Date().toISOString();

    const swipe: LocalSwipe = {
      id: swipeId,
      swiper_id: this.currentUserId,
      swiped_id: swipedUserId,
      is_like: isLike,
      is_super_like: isSuperLike,
      created_at: now,
      is_dirty: true // Needs to be synced
    };

    await offlineDb.swipes.add(swipe);

    // Check for match if it's a like
    if (isLike) {
      await this.checkForMatch(this.currentUserId, swipedUserId);
    }

    // Try to sync immediately if online
    if (await syncManager.getNetworkStatus()) {
      syncManager.performFullSync(this.currentUserId);
    }

    return swipeId;
  }

  public async getUserSwipes(userId: string): Promise<LocalSwipe[]> {
    console.log('🔍 Recherche swipes pour userId:', userId);
    const swipes = await offlineDb.swipes.where('swiper_id').equals(userId).toArray();
    console.log('📊 Swipes trouvés:', swipes.length);
    return swipes;
  }

  public async getUserLikes(userId: string): Promise<LocalSwipe[]> {
    return offlineDb.swipes
      .where('swiper_id')
      .equals(userId)
      .filter(swipe => swipe.is_like === true)
      .toArray();
  }

  private async checkForMatch(user1Id: string, user2Id: string): Promise<void> {
    console.log('🔍 Vérification de match entre:', user1Id, 'et', user2Id);
    
    // Check if the other user also swiped right
    const reciprocalSwipe = await offlineDb.swipes
      .where('swiper_id')
      .equals(user2Id)
      .filter(swipe => swipe.swiped_id === user1Id && swipe.is_like === true)
      .first();

    console.log('💕 Like réciproque trouvé:', !!reciprocalSwipe);

    if (reciprocalSwipe) {
      console.log('🎉 CRÉATION DU MATCH !');
      // Create match
      const matchId = uuidv4();
      const now = new Date().toISOString();

      // Ensure user1_id < user2_id for consistency
      const [sortedUser1, sortedUser2] = [user1Id, user2Id].sort();

      const match: LocalMatch = {
        id: matchId,
        user1_id: sortedUser1,
        user2_id: sortedUser2,
        is_active: true,
        created_at: now,
        is_dirty: true
      };

      await offlineDb.matches.add(match);
      console.log('✅ Match créé avec succès');
    } else {
      console.log('❌ Pas de like réciproque, pas de match');
    }
  }

  // Match Management
  public async getUserMatches(userId: string): Promise<LocalMatch[]> {
    return offlineDb.matches
      .where('user1_id').equals(userId)
      .or('user2_id').equals(userId)
      .and(match => match.is_active)
      .toArray();
  }

  public async getMatchById(matchId: string): Promise<LocalMatch | undefined> {
    return offlineDb.matches.where('id').equals(matchId).first();
  }

  // Message Management
  public async createMessage(
    matchId: string, 
    content: string, 
    messageType: string = 'text',
    mediaUrl?: string
  ): Promise<string> {
    if (!this.currentUserId) throw new Error('No current user set');

    const messageId = uuidv4();
    const now = new Date().toISOString();

    const message: LocalMessage = {
      id: messageId,
      match_id: matchId,
      sender_id: this.currentUserId,
      content,
      message_type: messageType,
      media_url: mediaUrl,
      is_read: false,
      created_at: now,
      is_dirty: true
    };

    await offlineDb.messages.add(message);

    // Try to sync immediately if online
    if (await syncManager.getNetworkStatus()) {
      syncManager.performFullSync(this.currentUserId);
    }

    return messageId;
  }

  public async getMatchMessages(matchId: string): Promise<LocalMessage[]> {
    return offlineDb.messages
      .where('match_id')
      .equals(matchId)
      .sortBy('created_at');
  }

  public async markMessagesAsRead(matchId: string, senderId: string): Promise<void> {
    const messages = await offlineDb.messages
      .where('match_id')
      .equals(matchId)
      .filter(message => message.sender_id === senderId && !message.is_read)
      .toArray();

    for (const message of messages) {
      await offlineDb.messages.update(message.id, {
        is_read: true,
        is_dirty: true
      });
    }

    // Try to sync immediately if online
    if (await syncManager.getNetworkStatus()) {
      syncManager.performFullSync(this.currentUserId);
    }
  }

  // Sync Management
  public async triggerSync(): Promise<SyncResult> {
    if (!this.currentUserId) {
      return { success: false, error: 'No current user', synced_tables: [], total_records: 0 };
    }

    return syncManager.performFullSync(this.currentUserId);
  }

  public async forceFullSync(): Promise<SyncResult> {
    if (!this.currentUserId) {
      return { success: false, error: 'No current user', synced_tables: [], total_records: 0 };
    }

    return syncManager.forceFullSync(this.currentUserId);
  }

  public async getOfflineStats() {
    return syncManager.getOfflineStats();
  }

  // Data Management
  public async clearUserData(userId: string): Promise<void> {
    // Clear user-specific data
    await offlineDb.swipes.where('swiper_id').equals(userId).delete();
    await offlineDb.matches
      .where('user1_id').equals(userId)
      .or('user2_id').equals(userId)
      .delete();
    
    // Clear messages from user's matches
    const userMatches = await this.getUserMatches(userId);
    const matchIds = userMatches.map(m => m.id);
    
    if (matchIds.length > 0) {
      await offlineDb.messages.where('match_id').anyOf(matchIds).delete();
    }
  }

  public async deleteSwipe(swipeId: string): Promise<void> {
    await offlineDb.swipes.delete(swipeId);
  }

  public async removeSwipeByUsers(swiperId: string, swipedId: string): Promise<void> {
    console.log('🗑️ Suppression swipe local:', { swiperId, swipedId });
    
    // Delete from local database
    await offlineDb.swipes
      .where('swiper_id').equals(swiperId)
      .and(swipe => swipe.swiped_id === swipedId)
      .delete();
    
    // Delete from Supabase
    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('swiper_id', swiperId)
      .eq('swiped_id', swipedId);
    
    if (error) {
      console.error('❌ Erreur suppression Supabase:', error);
      throw error;
    }
    
    console.log('✅ Swipe supprimé des deux bases de données');
    
    // Trigger sync to ensure consistency
    if (await syncManager.getNetworkStatus()) {
      await this.triggerSync();
    }
  }

  // Initialize offline data for a user
  public async initializeUserData(userId: string): Promise<void> {
    this.setCurrentUser(userId);
    
    // Trigger initial sync if online
    if (await syncManager.getNetworkStatus()) {
      await this.triggerSync();
    }
  }
}

export const offlineDataManager = new OfflineDataManager();