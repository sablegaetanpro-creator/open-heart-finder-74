import React, { useState, useEffect } from 'react';
import { Heart, X, Filter, Zap, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);

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

      {/* Single Profile Card with Vertical Scroll - Swipeable */}
      <div 
        className="flex-1 p-4 pb-24 overflow-hidden touch-pan-y"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          setTouchStart({ x: touch.clientX, y: touch.clientY });
        }}
        onTouchMove={(e) => {
          if (!touchStart) return;
          const touch = e.touches[0];
          const deltaX = touch.clientX - touchStart.x;
          const deltaY = touch.clientY - touchStart.y;
          
          // Only handle horizontal swipes (more horizontal than vertical)
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            e.preventDefault();
            setSwipeDirection(deltaX > 0 ? 'right' : 'left');
            setSwipeDistance(Math.abs(deltaX));
          }
        }}
        onTouchEnd={() => {
          if (swipeDirection && swipeDistance > 100) {
            handleSwipe(swipeDirection);
          }
          setTouchStart(null);
          setSwipeDirection(null);
          setSwipeDistance(0);
        }}
      >
        <div className="w-full max-w-sm mx-auto h-full">
          <div 
            className="h-full overflow-y-auto scrollbar-hide transition-transform duration-200"
            style={{
              transform: swipeDirection ? `translateX(${swipeDirection === 'right' ? swipeDistance : -swipeDistance}px) rotate(${(swipeDirection === 'right' ? swipeDistance : -swipeDistance) * 0.1}deg)` : 'none',
              opacity: swipeDistance > 50 ? Math.max(0.3, 1 - swipeDistance / 300) : 1
            }}
          >
            {/* Swipe Indicators */}
            {swipeDirection && swipeDistance > 50 && (
              <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
                <div className={`text-6xl font-bold ${swipeDirection === 'right' ? 'text-green-500' : 'text-red-500'}`}>
                  {swipeDirection === 'right' ? '❤️' : '✖️'}
                </div>
              </div>
            )}
            
            {/* Create alternating content */}
            {(() => {
              const content = [];
              let photoIndex = 0;
              
              // First photo with basic info
              content.push(
                <div key="header" className="w-full mb-4">
                  <Card className="overflow-hidden shadow-xl border-0">
                    <div className="relative aspect-[3/4]">
                      <img
                        src={allPhotos[photoIndex]}
                        alt={`${currentProfile.first_name} - Photo ${photoIndex + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-2xl font-bold">
                          {currentProfile.first_name}, {currentProfile.age}
                        </h2>
                        {currentProfile.profession && (
                          <p className="text-sm text-white/90 mt-1">{currentProfile.profession}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              );
              photoIndex++;
              
              // Bio section
              if (currentProfile.bio) {
                content.push(
                  <div key="bio" className="w-full mb-4">
                    <Card className="p-6 border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                      <h3 className="text-lg font-semibold mb-3 text-center">À propos</h3>
                      <p className="text-sm text-foreground/80 leading-relaxed text-center">
                        {currentProfile.bio}
                      </p>
                    </Card>
                  </div>
                );
                
                // Next photo if available
                if (photoIndex < allPhotos.length) {
                  content.push(
                    <div key={`photo-${photoIndex}`} className="w-full mb-4">
                      <Card className="overflow-hidden shadow-xl border-0">
                        <div className="aspect-[3/4]">
                          <img
                            src={allPhotos[photoIndex]}
                            alt={`${currentProfile.first_name} - Photo ${photoIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </Card>
                    </div>
                  );
                  photoIndex++;
                }
              }
              
              // Interests section
              if (currentProfile.interests && currentProfile.interests.length > 0) {
                content.push(
                  <div key="interests" className="w-full mb-4">
                    <Card className="p-6 border-0 bg-gradient-to-br from-secondary/10 to-secondary/5">
                      <h3 className="text-lg font-semibold mb-3 text-center">Centres d'intérêt</h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {currentProfile.interests.slice(0, 12).map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
                
                // Next photo if available
                if (photoIndex < allPhotos.length) {
                  content.push(
                    <div key={`photo-${photoIndex}`} className="w-full mb-4">
                      <Card className="overflow-hidden shadow-xl border-0">
                        <div className="aspect-[3/4]">
                          <img
                            src={allPhotos[photoIndex]}
                            alt={`${currentProfile.first_name} - Photo ${photoIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </Card>
                    </div>
                  );
                  photoIndex++;
                }
              }
              
              // Additional details section
              const hasDetails = currentProfile.height || currentProfile.education || currentProfile.exercise_frequency || currentProfile.children || currentProfile.animals || currentProfile.smoker || currentProfile.drinks;
              if (hasDetails) {
                content.push(
                  <div key="details" className="w-full mb-4">
                    <Card className="p-6 border-0 bg-gradient-to-br from-accent/10 to-accent/5">
                      <h3 className="text-lg font-semibold mb-3 text-center">Détails</h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {currentProfile.height && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Taille</span>
                            <span>{currentProfile.height} cm</span>
                          </div>
                        )}
                        {currentProfile.education && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Éducation</span>
                            <span className="text-right">{currentProfile.education}</span>
                          </div>
                        )}
                        {currentProfile.exercise_frequency && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sport</span>
                            <span className="text-right">{currentProfile.exercise_frequency}</span>
                          </div>
                        )}
                        {currentProfile.children && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Enfants</span>
                            <span className="text-right">{currentProfile.children}</span>
                          </div>
                        )}
                        {currentProfile.animals && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Animaux</span>
                            <span className="text-right">{currentProfile.animals}</span>
                          </div>
                        )}
                        {currentProfile.smoker && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tabac</span>
                            <span className="text-right">Fumeur</span>
                          </div>
                        )}
                        {currentProfile.drinks && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Alcool</span>
                            <span className="text-right">{currentProfile.drinks}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
                
                // Add remaining photos
                while (photoIndex < allPhotos.length) {
                  content.push(
                    <div key={`photo-${photoIndex}`} className="w-full mb-4">
                      <Card className="overflow-hidden shadow-xl border-0">
                        <div className="aspect-[3/4]">
                          <img
                            src={allPhotos[photoIndex]}
                            alt={`${currentProfile.first_name} - Photo ${photoIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </Card>
                    </div>
                  );
                  photoIndex++;
                }
              }
              
              return content;
            })()}
          </div>
        </div>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="fixed bottom-20 left-0 right-0 z-20 bg-transparent">
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