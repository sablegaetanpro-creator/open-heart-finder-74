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
// AdBanner removed - simplified version
import { offlineDataManager } from '@/lib/offlineDataManager';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Helpers: parse "lat,lng" and compute Haversine distance (km)
const parseLatLng = (location?: string): { lat: number; lng: number } | null => {
  if (!location) return null;
  const parts = location.split(',').map(p => parseFloat(p.trim()));
  if (parts.length !== 2 || parts.some(n => Number.isNaN(n))) return null;
  return { lat: parts[0], lng: parts[1] };
};

const haversineKm = (a?: string, b?: string): number | null => {
  const A = parseLatLng(a);
  const B = parseLatLng(b);
  if (!A || !B) return null;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(B.lat - A.lat);
  const dLng = toRad(B.lng - A.lng);
  const lat1 = toRad(A.lat);
  const lat2 = toRad(B.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

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
  const [discoverEnabled, setDiscoverEnabled] = useState(true);

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    if (user && profile) {
      // Lire réglage "Me montrer dans la découverte"
      try {
        const raw = localStorage.getItem('dating-app-settings');
        if (raw) {
          const s = JSON.parse(raw);
          setDiscoverEnabled(s?.discovery?.showMe !== false);
        } else {
          setDiscoverEnabled(true);
        }
      } catch {
        setDiscoverEnabled(true);
      }
      loadProfilesFromLocal();
    }
  }, [user, profile]);

  // Recharger quand les filtres changent ailleurs (réglages/modale)
  useEffect(() => {
    const handler = () => {
      if (user && profile) {
        try {
          const raw = localStorage.getItem('dating-app-settings');
          if (raw) {
            const s = JSON.parse(raw);
            setDiscoverEnabled(s?.discovery?.showMe !== false);
          }
        } catch {}
        loadProfilesFromLocal();
        
        // Si on est en ligne, forcer une synchronisation après un délai
        if (isOnline) {
          setTimeout(async () => {
            try {
              await triggerSync();
              loadProfilesFromLocal();
              console.log('🔄 Synchronisation forcée après refresh-data');
            } catch (error) {
              console.error('❌ Erreur synchronisation forcée:', error);
            }
          }, 500);
        }
      }
    };
    window.addEventListener('refresh-data', handler);
    return () => window.removeEventListener('refresh-data', handler);
  }, [user, profile, isOnline]);

  const loadProfilesFromLocal = async () => {
    if (!user || !profile) return;

    console.log('🔄 Début du chargement des profils...');
    console.log('👤 User:', user.id);
    console.log('📋 Profile:', profile);

    try {
      console.log('🔍 Vérification des paramètres de découverte...');
      // Lire le paramètre "Me montrer dans la découverte" (pour l'affichage du message)
      try {
        const raw = localStorage.getItem('dating-app-settings');
        if (raw) {
          const s = JSON.parse(raw);
          const showMe = s?.discovery?.showMe !== false;
          setDiscoverEnabled(showMe);
          console.log('🎯 Paramètre "Me montrer" activé:', showMe);
        }
      } catch (error) {
        console.log('⚠️ Erreur lecture paramètres découverte:', error);
      }

      const userSwipes = await offlineDataManager.getUserSwipes(user.id);
      console.log('💕 Swipes de l\'utilisateur:', userSwipes.length);
      
      const swipedUserIds = userSwipes.map(swipe => swipe.swiped_id);
      const excludeIds = [user.id, ...swipedUserIds];
      console.log('🚫 IDs exclus:', excludeIds);
      
      const savedFiltersRaw = localStorage.getItem('dating_filters');
      const savedFilters = savedFiltersRaw ? JSON.parse(savedFiltersRaw) : null;
      console.log('🔍 Filtres sauvegardés:', savedFilters);
      
      const localProfiles = await offlineDataManager.getProfiles(excludeIds, 200);
      console.log('📊 Profils locaux trouvés:', localProfiles.length);

      const compatibleProfiles = localProfiles.filter((p: any) => {
        const genderMatch = (
          (profile.looking_for === 'les_deux' || profile.looking_for === p.gender) &&
          (p.looking_for === 'les_deux' || p.looking_for === profile.gender)
        );
        if (!genderMatch) return false;
        if (!savedFilters) return true;
        // Filtre Genre explicite (mapper non_binaire -> autre)
        if (savedFilters.gender && savedFilters.gender !== 'tous') {
          const targetGender = savedFilters.gender === 'non_binaire' ? 'autre' : savedFilters.gender;
          if (p.gender !== targetGender) return false;
        }
        if (p.age < savedFilters.ageRange[0] || p.age > savedFilters.ageRange[1]) return false;
        if (savedFilters.relationshipType !== 'tous' && (p.relationship_type || p.relationshipType) !== savedFilters.relationshipType) return false;
        // Taille: exiger une valeur et qu'elle soit dans la plage
        if (p.height == null || p.height < savedFilters.height[0] || p.height > savedFilters.height[1]) return false;
        if (savedFilters.smoker !== 'tous' && String(p.smoker) !== savedFilters.smoker) return false;
        if (savedFilters.drinks !== 'tous' && p.drinks !== savedFilters.drinks) return false;
        if (savedFilters.animals !== 'tous' && p.animals !== savedFilters.animals) return false;
        if (savedFilters.children !== 'tous' && p.children !== savedFilters.children) return false;
        if (savedFilters.exerciseFrequency !== 'tous' && p.exercise_frequency !== savedFilters.exerciseFrequency) return false;
        if (savedFilters.bodyType?.length && !savedFilters.bodyType.includes(p.body_type || p.bodyType || '')) return false;
        if (savedFilters.religion?.length && !savedFilters.religion.includes(p.religion || '')) return false;
        if (savedFilters.politics?.length && !savedFilters.politics.includes(p.politics || '')) return false;
        if (savedFilters.education?.length && !savedFilters.education.some((v: string) => (p.education || '').includes(v))) return false;
        if (savedFilters.profession?.length && !savedFilters.profession.some((v: string) => (p.profession || '').includes(v))) return false;
        if (savedFilters.interests?.length) {
          const hasCommon = (p.interests || []).some((i: string) => savedFilters.interests.includes(i));
          if (!hasCommon) return false;
        }
        // Distance max si positions disponibles
        if (typeof savedFilters.maxDistance === 'number') {
          const d = haversineKm((profile as any).location, (p as any).location);
          if (d != null && d > savedFilters.maxDistance) return false;
        }
        return true;
      });

      console.log('✅ Profils compatibles après filtrage:', compatibleProfiles.length);

      setProfiles(compatibleProfiles as Profile[]);
      setCurrentProfileIndex(0);
      
      if (compatibleProfiles.length === 0 && isOnline) {
        console.log('🔄 Aucun profil trouvé, synchronisation...');
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

    console.log('🔄 Début du swipe:', { direction, isLike, isSuperLike, targetUser: currentProfile.user_id });

    try {
      await offlineDataManager.createSwipe(currentProfile.user_id, isLike, isSuperLike);
      console.log('✅ Swipe créé avec succès');

      if (isLike) {
        console.log('🔍 Vérification des matches...');
        const userMatches = await offlineDataManager.getUserMatches(user.id);
        console.log('📊 Matches actuels:', userMatches.length);
        
        const hasMatch = userMatches.some(match => 
          (match.user1_id === user.id && match.user2_id === currentProfile.user_id) ||
          (match.user1_id === currentProfile.user_id && match.user2_id === user.id)
        );

        console.log('🎯 Match trouvé:', hasMatch);

        if (hasMatch) {
          toast({
            title: isSuperLike ? "🌟 Super Match !" : "🎉 C'est un match !",
            description: "Vous pouvez maintenant vous envoyer des messages"
          });
          
          // Forcer le rafraîchissement des messages
          setTimeout(() => {
            window.dispatchEvent(new Event('refresh-data'));
          }, 1000);
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
      console.log('🔄 Synchronisation forcée...');
      await triggerSync();
      console.log('✅ Synchronisation terminée');
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
          <h3 className="text-xl font-semibold mb-2">{discoverEnabled ? 'Plus de profils !' : 'Découverte désactivée'}</h3>
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
          {/* Mount dialog even in empty state so the button works */}
          <EnhancedFilterDialog 
            open={showFilterDialog}
            onOpenChange={setShowFilterDialog}
            onFiltersApply={loadProfilesFromLocal}
          />
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