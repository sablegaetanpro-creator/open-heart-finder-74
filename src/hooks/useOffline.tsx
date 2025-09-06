import React, { createContext, useContext, useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { syncManager, SyncResult } from '@/lib/offlineSync';
import { offlineDataManager } from '@/lib/offlineDataManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncProgress: SyncResult | null;
  offlineStats: {
    profiles: number;
    swipes: number;
    matches: number;
    messages: number;
    total: number;
  } | null;
  triggerSync: () => Promise<void>;
  getNetworkStatus: () => Promise<boolean>;
  clearOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncResult | null>(null);
  const [offlineStats, setOfflineStats] = useState<OfflineContextType['offlineStats']>(null);

  useEffect(() => {
    initializeOfflineSystem();
  }, []);

  useEffect(() => {
    if (user) {
      offlineDataManager.initializeUserData(user.id);
      loadOfflineStats();
    }
  }, [user]);

  const initializeOfflineSystem = async () => {
    // Initialize network status
    const status = await Network.getStatus();
    setIsOnline(status.connected);

    // Listen for network changes
    Network.addListener('networkStatusChange', async (status) => {
      const wasOffline = !isOnline;
      setIsOnline(status.connected);
      
      if (wasOffline && status.connected) {
        toast({
          title: "Connexion rétablie",
          description: "Synchronisation en cours...",
        });
        await triggerSync();
      } else if (!status.connected) {
        toast({
          title: "Mode hors ligne",
          description: "L'app continue de fonctionner localement",
        });
      }
    });

    // Listen for sync completion
    syncManager.onSyncComplete(() => {
      setLastSyncTime(new Date());
      loadOfflineStats();
    });

    // Load initial stats
    loadOfflineStats();
  };

  const loadOfflineStats = async () => {
    try {
      const stats = await syncManager.getOfflineStats();
      setOfflineStats(stats);
    } catch (error) {
      console.error('Failed to load offline stats:', error);
    }
  };

  const triggerSync = async () => {
    if (isSyncing || !user) return;

    setIsSyncing(true);
    setSyncProgress(null);

    try {
      const result = await offlineDataManager.triggerSync();
      setSyncProgress(result);
      
      if (result.success) {
        toast({
          title: "Synchronisation réussie",
          description: `${result.total_records} éléments synchronisés`,
        });
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: result.error || "Erreur inconnue",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Erreur inconnue",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
      await loadOfflineStats();
    }
  };

  const getNetworkStatus = async (): Promise<boolean> => {
    return syncManager.getNetworkStatus();
  };

  const clearOfflineData = async () => {
    try {
      await syncManager.clearOfflineData();
      await loadOfflineStats();
      toast({
        title: "Données supprimées",
        description: "Toutes les données locales ont été effacées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les données locales",
        variant: "destructive"
      });
    }
  };

  const value: OfflineContextType = {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncProgress,
    offlineStats,
    triggerSync,
    getNetworkStatus,
    clearOfflineData
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};