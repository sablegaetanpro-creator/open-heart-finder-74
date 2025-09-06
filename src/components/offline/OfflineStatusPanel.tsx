import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Download, 
  Upload,
  HardDrive,
  Settings
} from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { toast } from '@/hooks/use-toast';

const OfflineStatusPanel: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    lastSyncTime, 
    syncProgress, 
    offlineStats, 
    triggerSync, 
    clearOfflineData 
  } = useOffline();

  const [showDetails, setShowDetails] = useState(false);

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Jamais';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return lastSyncTime.toLocaleDateString('fr-FR');
  };

  const getStorageSize = () => {
    if (!offlineStats) return '0 MB';
    
    // Rough estimation: each record ~1KB
    const sizeKB = offlineStats.total * 1;
    const sizeMB = sizeKB / 1024;
    
    return sizeMB < 1 ? `${sizeKB} KB` : `${sizeMB.toFixed(1)} MB`;
  };

  return (
    <Card className="p-4 m-4 border border-border/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <h3 className="font-semibold">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </h3>
          {isSyncing && (
            <Badge variant="secondary" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Synchronisation...
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {offlineStats?.total || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            Éléments stockés
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-foreground">
            {getStorageSize()}
          </div>
          <div className="text-xs text-muted-foreground">
            Espace utilisé
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="text-center mb-4">
        <div className="text-sm text-muted-foreground">
          Dernière sync: {formatLastSync()}
        </div>
        
        {syncProgress && (
          <div className="mt-2">
            {syncProgress.success ? (
              <Badge variant="outline" className="text-green-600">
                ✓ {syncProgress.total_records} éléments synchronisés
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                ✗ {syncProgress.error}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Detailed Stats */}
      {showDetails && offlineStats && (
        <div className="space-y-3 pt-4 border-t border-border/20">
          <h4 className="text-sm font-medium">Données locales:</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Profils:</span>
              <span className="font-mono">{offlineStats.profiles}</span>
            </div>
            <div className="flex justify-between">
              <span>Swipes:</span>
              <span className="font-mono">{offlineStats.swipes}</span>
            </div>
            <div className="flex justify-between">
              <span>Matches:</span>
              <span className="font-mono">{offlineStats.matches}</span>
            </div>
            <div className="flex justify-between">
              <span>Messages:</span>
              <span className="font-mono">{offlineStats.messages}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          className="flex-1"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Synchroniser
        </Button>
        
        {showDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Supprimer toutes les données locales ?')) {
                clearOfflineData();
              }
            }}
            className="flex-1"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Vider le cache
          </Button>
        )}
      </div>
    </Card>
  );
};

export default OfflineStatusPanel;