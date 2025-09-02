import React, { useState, useEffect } from 'react';
import { Heart, X, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { toast } from '@/hooks/use-toast';
import EnhancedFilterDialog from './EnhancedFilterDialog';
import { offlineDataManager } from '@/lib/offlineDataManager';
import SwipeButtons from './SwipeButtons';
import EmptySwipeState from './EmptySwipeState';
import ProfileCard from './ProfileCard';
import BioSection from './BioSection';
import InterestsSection from './InterestsSection';
import DetailsSection from './DetailsSection';
import PhotoGrid from './PhotoGrid';
import HeaderActions from './HeaderActions';
import SwipeIndicator from './SwipeIndicator';
import AdSection from './AdSection';
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
      const { swipeId, isMatch } = await offlineDataManager.createSwipe(currentProfile.user_id, isLike, isSuperLike);
      console.log('✅ Swipe créé avec succès', { swipeId, isMatch });

      if (isLike) {
        if (isMatch) {
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
      <>
        <EmptySwipeState
          isOnline={isOnline}
          discoverEnabled={discoverEnabled}
          onFiltersClick={() => setShowFilterDialog(true)}
          onRefreshClick={handleRefresh}
          isSyncing={isSyncing}
        />
        {/* Mount dialog even in empty state so the button works */}
        <EnhancedFilterDialog 
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          onFiltersApply={loadProfilesFromLocal}
        />
      </>
    );
  }

  const allPhotos = currentProfile.additional_photos 
    ? [currentProfile.profile_photo_url, ...currentProfile.additional_photos].filter(Boolean)
    : [currentProfile.profile_photo_url];

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Header with Network Status */}
      <HeaderActions
        profilesCount={profiles.length - currentProfileIndex}
        swipeCount={swipeCount}
        onRefresh={handleRefresh}
        onFiltersClick={() => setShowFilterDialog(true)}
        isSyncing={isSyncing}
      />

      {/* Ad Banner */}
      <AdSection isOnline={isOnline} />

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
            <SwipeIndicator 
              swipeDirection={swipeDirection} 
              swipeDistance={swipeDistance} 
            />
            
            {/* Composants modulaires pour le profil */}
            <ProfileCard profile={currentProfile} />
            <BioSection bio={currentProfile.bio} />
            <InterestsSection interests={currentProfile.interests} />
            <DetailsSection profile={currentProfile} />
            <PhotoGrid photos={allPhotos} startIndex={1} />
          </div>
        </div>
      </div>

      {/* Swipe Action Buttons - External Component */}
      <SwipeButtons 
        onSwipe={handleSwipe} 
        isProcessing={isProcessing} 
      />

      <EnhancedFilterDialog 
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onFiltersApply={loadProfilesFromLocal}
      />
    </div>
  );
};

export default SingleProfileSwipeInterface;