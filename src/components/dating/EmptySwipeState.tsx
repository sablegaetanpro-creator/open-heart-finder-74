import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Filter, RefreshCw } from 'lucide-react';

interface EmptySwipeStateProps {
  isOnline: boolean;
  discoverEnabled: boolean;
  onFiltersClick: () => void;
  onRefreshClick: () => void;
  isSyncing: boolean;
}

const EmptySwipeState: React.FC<EmptySwipeStateProps> = ({
  isOnline,
  discoverEnabled,
  onFiltersClick,
  onRefreshClick,
  isSyncing
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="p-8 text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-love rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {discoverEnabled ? 'Plus de profils !' : 'Découverte désactivée'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {discoverEnabled
            ? (isOnline 
            ? "Revenez plus tard pour découvrir de nouveaux profils."
              : "Connectez-vous à internet pour charger plus de profils.")
            : "Activez l’option \"Me montrer dans la découverte\" dans les Réglages pour voir des profils."
          }
        </p>
        <div className="space-y-3">
          <Button 
            onClick={onFiltersClick} 
            variant="outline" 
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            Modifier les filtres
          </Button>
          <Button 
            onClick={onRefreshClick}
            variant="outline" 
            className="w-full"
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronisation...' : 'Actualiser'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EmptySwipeState;