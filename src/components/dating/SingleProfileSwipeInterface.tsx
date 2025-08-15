import React, { useState, useEffect } from 'react';
import { Heart, X, Filter, Zap, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { toast } from '@/hooks/use-toast';
import EnhancedFilterDialog from './EnhancedFilterDialog';
import AdBanner from '../monetization/AdBanner';
import { offlineDataManager } from '@/lib/offlineDataManager';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SingleProfileSwipeInterfaceProps {
  onAdView?: () => void;
}

const SingleProfileSwipeInterface: React.FC<SingleProfileSwipeInterfaceProps> = ({ onAdView }) => {
  const { user, profile } = useAuth();
  const { isOnline, isSyncing, triggerSync, offlineStats } = useOffline();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    if (user && profile) {
      loadProfilesFromLocal();
    }
  }, [user, profile]);

  const loadProfilesFromLocal = async () => {
    if (!user || !profile) return;

    try {
      const userSwipes = await offlineDataManager.getUserSwipes(user.id);
      const swipedUserIds = userSwipes.map(swipe => swipe.swiped_id);
      const excludeIds = [user.id, ...swipedUserIds];
      const localProfiles = await offlineDataManager.getProfiles(excludeIds, 50);
      
      const compatibleProfiles = localProfiles.filter(p => {
        const genderMatch = (
          (profile.looking_for === 'les_deux' || profile.looking_for === p.gender) &&
          (p.looking_for === 'les_deux' || p.looking_for === profile.gender)
        );
        return genderMatch;
      });

      setProfiles(compatibleProfiles as Profile[]);
      setCurrentProfileIndex(0);
      
      if (compatibleProfiles.length === 0 && isOnline) {
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

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!user || !currentProfile || isProcessing) return;

    setIsProcessing(true);
    const isLike = direction === 'right' || direction === 'super';
    const isSuperLike = direction === 'super';

    try {
      await offlineDataManager.createSwipe(currentProfile.user_id, isLike, isSuperLike);

      if (isLike) {
        const userMatches = await offlineDataManager.getUserMatches(user.id);
        const hasMatch = userMatches.some(match => 
          (match.user1_id === user.id && match.user2_id === currentProfile.user_id) ||
          (match.user1_id === currentProfile.user_id && match.user2_id === user.id)
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

      // Move to next profile
      const nextIndex = currentProfileIndex + 1;
      if (nextIndex < profiles.length) {
        setCurrentProfileIndex(nextIndex);
      } else {
        // Remove current profile and reset index
        setProfiles(prev => prev.slice(1));
        setCurrentProfileIndex(0);
      }

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
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
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

  if (!currentProfile) {
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

  const allPhotos = currentProfile.additional_photos 
    ? [currentProfile.profile_photo_url, ...currentProfile.additional_photos].filter(Boolean)
    : [currentProfile.profile_photo_url];

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Header with Network Status */}
      <div className="flex justify-between items-center p-4 bg-background border-b border-border/10 relative z-10">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{profiles.length - currentProfileIndex} profils</Badge>
          {swipeCount > 0 && (
            <Badge variant="secondary">{swipeCount} swipes</Badge>
          )}
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-red-500" />
          ) : (
            <Wifi className="w-4 h-4 text-green-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          
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
          className="mx-4 mt-2 relative z-10"
        />
      )}

      {/* Single Profile Card with Carousel */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24">
        <Card className="w-full max-w-sm bg-card border-0 overflow-hidden shadow-xl">
          {/* Profile Header */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {currentProfile.first_name}
                </h2>
                <p className="text-lg text-muted-foreground">{currentProfile.age} ans</p>
              </div>
              {currentProfile.profession && (
                <Badge variant="secondary" className="text-xs">
                  {currentProfile.profession}
                </Badge>
              )}
            </div>
          </div>

          {/* Photo Carousel */}
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {allPhotos.map((photo, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[3/4] w-full">
                      <img
                        src={photo}
                        alt={`${currentProfile.first_name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </CarouselItem>
                ))}
                
                {/* Alternate with profile info */}
                <CarouselItem>
                  <div className="aspect-[3/4] w-full bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-center">À propos de {currentProfile.first_name}</h3>
                      
                      {currentProfile.bio && (
                        <p className="text-sm text-foreground/80 leading-relaxed text-center">
                          {currentProfile.bio}
                        </p>
                      )}

                      {currentProfile.interests && currentProfile.interests.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-center">Centres d'intérêt</h4>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {currentProfile.interests.slice(0, 8).map((interest, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              
              {allPhotos.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
        </Card>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="fixed bottom-20 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border/10">
        <div className="flex justify-center items-center gap-6 py-4">
          {/* Dislike */}
          <Button
            size="lg"
            variant="outline"
            disabled={isProcessing}
            className="rounded-full w-16 h-16 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-lg"
            onClick={() => handleSwipe('left')}
            aria-label="Passer ce profil"
          >
            <X className="w-7 h-7" />
          </Button>

          {/* Super Like */}
          <Button
            size="lg"
            disabled={isProcessing}
            className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
            onClick={() => handleSwipe('super')}
            aria-label="Super like"
          >
            <Zap className="w-6 h-6" />
          </Button>

          {/* Like */}
          <Button
            size="lg"
            disabled={isProcessing}
            className="rounded-full w-16 h-16 p-0 bg-gradient-love shadow-love hover:opacity-90 transition-all duration-200"
            onClick={() => handleSwipe('right')}
            aria-label="Aimer ce profil"
          >
            <Heart className="w-7 h-7 text-white fill-current" />
          </Button>
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

export default SingleProfileSwipeInterface;