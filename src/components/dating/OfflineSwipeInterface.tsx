import React, { useState, useEffect } from 'react';
import { Heart, X, Filter, Zap, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { toast } from '@/hooks/use-toast';
import HappnProfileCard from './HappnProfileCard';
import EnhancedFilterDialog from './EnhancedFilterDialog';
import AdBanner from '../monetization/AdBanner';
import { offlineDataManager } from '@/lib/offlineDataManager';

interface OfflineSwipeInterfaceProps {
  onAdView?: () => void;
}

const OfflineSwipeInterface: React.FC<OfflineSwipeInterfaceProps> = ({ onAdView }) => {
  const { user, profile } = useAuth();
  const { isOnline, isSyncing, triggerSync, offlineStats } = useOffline();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadProfilesFromLocal();
    }
  }, [user, profile]);

  const loadProfilesFromLocal = async () => {
    if (!user || !profile) return;

    try {
      // Get already swiped user IDs from local database
      const userSwipes = await offlineDataManager.getUserSwipes(user.id);
      const swipedUserIds = userSwipes.map(swipe => swipe.swiped_id);
      
      // Exclude current user and already swiped users
      const excludeIds = [user.id, ...swipedUserIds];

      // Load profiles from local database
      const localProfiles = await offlineDataManager.getProfiles(excludeIds, 50);
      
      // Filter by mutual compatibility
      const compatibleProfiles = localProfiles.filter(p => {
        // Check gender preference compatibility
        const genderMatch = (
          (profile.looking_for === 'les_deux' || profile.looking_for === p.gender) &&
          (p.looking_for === 'les_deux' || p.looking_for === profile.gender)
        );
        
        return genderMatch;
      });

      setProfiles(compatibleProfiles as Profile[]);
      
      if (compatibleProfiles.length === 0 && isOnline) {
        // Try to sync for more profiles
        await triggerSync();
      }
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les profils locaux",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'super', profileId: string) => {
    if (!user) return;

    const isLike = direction === 'right' || direction === 'super';
    const isSuperLike = direction === 'super';

    try {
      // Create swipe in local database
      await offlineDataManager.createSwipe(profileId, isLike, isSuperLike);

      if (isLike) {
        // Check for match locally
        const userMatches = await offlineDataManager.getUserMatches(user.id);
        const hasMatch = userMatches.some(match => 
          (match.user1_id === user.id && match.user2_id === profileId) ||
          (match.user1_id === profileId && match.user2_id === user.id)
        );

        if (hasMatch) {
          toast({
            title: isSuperLike ? "🌟 Super Match !" : "🎉 C'est un match !",
            description: "Vous pouvez maintenant vous envoyer des messages"
          });
        } else {
          toast({
            title: isSuperLike ? "⭐ Super Like envoyé !" : "❤️ Like envoyé !",
            description: isOnline ? "Espérons que c'est réciproque !" : "Sera synchronisé quand vous serez en ligne"
          });
        }
      }

      // Remove swiped profile from list
      setProfiles(prev => prev.filter(p => p.user_id !== profileId));
      setSwipeCount(prev => prev + 1);

      // Show ad every 10 swipes
      if ((swipeCount + 1) % 10 === 0 && onAdView) {
        onAdView();
      }

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le swipe",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    if (isOnline && !isSyncing) {
      setIsLoading(true);
      await triggerSync();
      setTimeout(() => {
        loadProfilesFromLocal();
      }, 1000);
    } else {
      loadProfilesFromLocal();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-love rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Plus de profils !</h3>
          <p className="text-muted-foreground mb-6">
            {isOnline 
              ? "Revenez plus tard pour découvrir de nouveaux profils."
              : "Connectez-vous à internet pour charger plus de profils."
            }
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => setShowFilterDialog(true)} 
              variant="outline" 
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Modifier les filtres
            </Button>
            <Button 
              onClick={handleRefresh}
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
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header with Network Status */}
      <div className="flex justify-between items-center p-4 bg-background border-b border-border/10">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{profiles.length} profils</Badge>
          {swipeCount > 0 && (
            <Badge variant="secondary">{swipeCount} swipes</Badge>
          )}
          {offlineStats && (
            <Badge variant="outline" className="text-xs">
              {offlineStats.total} local
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Network Status Indicator */}
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs ml-1">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Filter Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilterDialog(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Ad Banner */}
      {isOnline && (
        <AdBanner 
          adUnitId="ca-app-pub-3940256099942544/6300978111" 
          className="mx-4 mt-2"
        />
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <div className="mx-4 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center text-sm text-yellow-800 dark:text-yellow-200">
            <WifiOff className="w-4 h-4 mr-2" />
            Mode hors ligne - Les actions seront synchronisées plus tard
          </div>
        </div>
      )}

      {/* Vertical Scrolling Feed - Happn Style */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {profiles.map((profile, index) => (
            <div key={profile.id}>
              <HappnProfileCard
                profile={profile}
                onSwipe={handleSwipe}
              />
              
              {/* Insert ad every 3 profiles (only when online) */}
              {isOnline && (index + 1) % 3 === 0 && (
                <div className="my-6">
                  <AdBanner 
                    adUnitId="ca-app-pub-3940256099942544/2247696110"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <EnhancedFilterDialog 
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onFiltersApply={loadProfilesFromLocal}
      />
    </div>
  );
};

export default OfflineSwipeInterface;