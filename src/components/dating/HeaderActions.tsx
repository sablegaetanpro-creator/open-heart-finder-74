import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';

interface HeaderActionsProps {
  profilesCount: number;
  swipeCount: number;
  onRefresh: () => void;
  onFiltersClick: () => void;
  isSyncing: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  profilesCount,
  swipeCount,
  onRefresh,
  onFiltersClick,
  isSyncing
}) => {
  return (
    <div className="flex justify-between items-center p-4 bg-background border-b border-border/10 relative z-10">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {profilesCount} profils
        </span>
        {swipeCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {swipeCount} swipes
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isSyncing}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onFiltersClick}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default HeaderActions;