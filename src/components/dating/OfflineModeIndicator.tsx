import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Users, MessageCircle, Heart } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

const OfflineModeIndicator: React.FC = () => {
  const { isOnline, offlineStats } = useOffline();

  if (isOnline) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Offline Status Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Mode hors ligne activé - Fonctionnalités limitées
        </AlertDescription>
      </Alert>

      {/* Available Data Summary */}
      <div className="grid grid-cols-1 gap-3">
        {/* Matches Available */}
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Matches</p>
              <p className="text-sm text-muted-foreground">Consultables hors ligne</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary">
            {offlineStats?.matches || 0}
          </span>
        </div>

        {/* Messages Limitation */}
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border opacity-60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Messages</p>
              <p className="text-sm text-muted-foreground">Indisponibles</p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            Connexion requise
          </span>
        </div>

        {/* Likes Limitation */}
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border opacity-60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Likes reçus/envoyés</p>
              <p className="text-sm text-muted-foreground">Indisponibles</p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            Connexion requise
          </span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Reconnectez-vous pour accéder à toutes les fonctionnalités
      </p>
    </div>
  );
};

export default OfflineModeIndicator;