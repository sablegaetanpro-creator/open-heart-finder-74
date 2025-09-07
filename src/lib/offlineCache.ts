// Cache offline simplifié avec IndexedDB pour les données critiques
// Stockage : messages, compteurs likes, métadonnées matches

export interface CachedMessage {
  id: number;
  match_id: number;
  sender_id: string;
  content: string;
  content_type: string;
  is_read: boolean;
  created_at: string;
  is_dirty?: boolean; // Nécessite sync
}

export interface CachedMatch {
  match_id: number;
  other_user_id: string;
  other_user_name: string;
  other_user_photo: string;
  last_message_content?: string;
  last_message_time?: string;
  has_messages: boolean;
}

export interface CachedLikesCount {
  user_id: string;
  given: number;
  received: number;
  last_updated: string;
}

export interface SyncTimestamp {
  table_name: string;
  last_sync: string;
}

class OfflineCache {
  private dbName = 'DatingAppCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store pour les messages
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('match_id', 'match_id', { unique: false });
          messagesStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Store pour les matches
        if (!db.objectStoreNames.contains('matches')) {
          db.createObjectStore('matches', { keyPath: 'match_id' });
        }

        // Store pour les compteurs de likes
        if (!db.objectStoreNames.contains('likes_count')) {
          db.createObjectStore('likes_count', { keyPath: 'user_id' });
        }

        // Store pour les timestamps de sync
        if (!db.objectStoreNames.contains('sync_timestamps')) {
          db.createObjectStore('sync_timestamps', { keyPath: 'table_name' });
        }
      };
    });
  }

  // Messages
  async cacheMessages(messages: CachedMessage[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    
    for (const message of messages) {
      await store.put(message);
    }
  }

  async getCachedMessages(matchId: number): Promise<CachedMessage[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const index = store.index('match_id');
      const request = index.getAll(matchId);
      
      request.onsuccess = () => {
        const messages = request.result.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addPendingMessage(message: CachedMessage): Promise<void> {
    if (!this.db) await this.init();
    
    const messageWithFlag = { ...message, is_dirty: true };
    const transaction = this.db!.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    await store.put(messageWithFlag);
  }

  async getPendingMessages(): Promise<CachedMessage[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const pendingMessages = request.result.filter(msg => msg.is_dirty);
        resolve(pendingMessages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markMessageSynced(messageId: number): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.get(messageId);
    
    request.onsuccess = () => {
      if (request.result) {
        const message = { ...request.result, is_dirty: false };
        store.put(message);
      }
    };
  }

  // Matches
  async cacheMatches(matches: CachedMatch[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['matches'], 'readwrite');
    const store = transaction.objectStore('matches');
    
    for (const match of matches) {
      await store.put(match);
    }
  }

  async getCachedMatches(): Promise<CachedMatch[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['matches'], 'readonly');
      const store = transaction.objectStore('matches');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Compteurs de likes
  async cacheLikesCount(likesCount: CachedLikesCount): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['likes_count'], 'readwrite');
    const store = transaction.objectStore('likes_count');
    await store.put(likesCount);
  }

  async getCachedLikesCount(userId: string): Promise<CachedLikesCount | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['likes_count'], 'readonly');
      const store = transaction.objectStore('likes_count');
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Timestamps de synchronisation
  async updateSyncTimestamp(tableName: string): Promise<void> {
    if (!this.db) await this.init();
    
    const timestamp: SyncTimestamp = {
      table_name: tableName,
      last_sync: new Date().toISOString()
    };
    
    const transaction = this.db!.transaction(['sync_timestamps'], 'readwrite');
    const store = transaction.objectStore('sync_timestamps');
    await store.put(timestamp);
  }

  async getSyncTimestamp(tableName: string): Promise<string | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_timestamps'], 'readonly');
      const store = transaction.objectStore('sync_timestamps');
      const request = store.get(tableName);
      
      request.onsuccess = () => {
        resolve(request.result?.last_sync || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Nettoyage (supprimer les anciennes données)
  async cleanup(retentionDays: number = 30): Promise<void> {
    if (!this.db) await this.init();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();
    
    const transaction = this.db!.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const index = store.index('created_at');
    
    const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        // Ne supprimer que les messages synchronisés (pas dirty)
        if (!cursor.value.is_dirty) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  // Vérifier si offline
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Clear tout le cache (reset)
  async clearAllCache(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(
      ['messages', 'matches', 'likes_count', 'sync_timestamps'], 
      'readwrite'
    );
    
    await Promise.all([
      transaction.objectStore('messages').clear(),
      transaction.objectStore('matches').clear(),
      transaction.objectStore('likes_count').clear(),
      transaction.objectStore('sync_timestamps').clear()
    ]);
  }
}

// Instance singleton
export const offlineCache = new OfflineCache();

// Utilitaires de synchronisation
export async function syncOfflineMessages(userId: string): Promise<{ success: boolean; synced: number }> {
  try {
    const pendingMessages = await offlineCache.getPendingMessages();
    let syncedCount = 0;
    
    for (const message of pendingMessages) {
      try {
        // Ici vous appelleriez sendMessage du messageLogic
        // const result = await sendMessage(message.match_id, message.sender_id, message.content, message.content_type);
        // if (result.success) {
        //   await offlineCache.markMessageSynced(message.id);
        //   syncedCount++;
        // }
      } catch (error) {
        console.error('Failed to sync message:', message.id, error);
      }
    }
    
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error('Sync offline messages error:', error);
    return { success: false, synced: 0 };
  }
}

// Hook pour détecter le statut de connexion
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// React import nécessaire pour le hook
import { useState, useEffect } from 'react';