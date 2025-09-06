import React, { useState, useEffect } from 'react';
import { Heart, X, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import EnhancedFilterDialog from './EnhancedFilterDialog';
import AdBanner from '../monetization/AdBanner';
import { simpleDataManager, ProfileData } from '@/lib/simpleDataManager';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SimplifiedSwipeInterfaceProps {
  onAdView?: () => void;
}

const SimplifiedSwipeInterface: React.FC<SimplifiedSwipeInterfaceProps> = ({ onAdView }) => {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    if (user && profile) {
      loadProfiles();
    }
  }, [user, profile]);

  const loadProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Récupérer les IDs des profils déjà swipés pour les exclure
      const userSwipes = await getUserSwipedIds(user.id);
      
      // Charger les profils selon le nouveau système
      const newProfiles = await simpleDataManager.getDiscoveryProfiles(
        user.id,
        userSwipes,
        20
      );
      
      setProfiles(newProfiles);
      setCurrentProfileIndex(0);
      setCurrentPhotoIndex(0);
      
      if (newProfiles.length === 0) {
        toast({
          title: "Plus de profils",
          description: "Revenez plus tard pour voir de nouveaux profils !",
        });
      }
    } catch (error) {
      console.error('Erreur chargement profils:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les profils",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserSwipedIds = async (userId: string): Promise<string[]> => {
    try {
      // Récupérer tous les swipes de l'utilisateur (likes et dislikes)
      const { data, error } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', userId);

      if (error) throw error;
      return data?.map(swipe => swipe.swiped_id) || [];
    } catch (error) {
      console.error('Erreur récupération swipes:', error);
      return [];
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentProfile || !user || isProcessing) return;

    setIsProcessing(true);
    const isLike = direction === 'right';

    try {
      // Créer le swipe avec le nouveau système
      const isMatch = await simpleDataManager.createSwipe(
        user.id,
        currentProfile.user_id,
        isLike
      );

      // Incrémenter le compteur de swipes
      setSwipeCount(prev => prev + 1);

      // Avancer au profil suivant
      if (currentProfileIndex + 1 >= profiles.length) {
        // Plus de profils, recharger
        setTimeout(() => {
          loadProfiles();
        }, 500);
      } else {
        setCurrentProfileIndex(prev => prev + 1);
        setCurrentPhotoIndex(0);
      }

      // Déclencher la publicité après un certain nombre de swipes
      if (swipeCount > 0 && swipeCount % 10 === 0 && onAdView) {
        onAdView();
      }

    } catch (error) {
      console.error('Erreur swipe:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre action",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProfilePhotos = (profile: ProfileData) => {
    const photos = [profile.profile_photo_url];
    if (profile.additional_photos) {
      photos.push(...profile.additional_photos);
    }
    return photos.filter(Boolean);
  };

  const nextPhoto = () => {
    if (!currentProfile) return;
    const photos = getProfilePhotos(currentProfile);
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (!currentProfile) return;
    const photos = getProfilePhotos(currentProfile);
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Plus de profils à découvrir</h2>
          <p className="text-muted-foreground">
            Revenez plus tard pour voir de nouveaux profils !
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={() => setShowFilterDialog(true)} variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Modifier les filtres
          </Button>
          
          <Button onClick={loadProfiles}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <EnhancedFilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          onFiltersApply={loadProfiles}
        />
      </div>
    );
  }

  const photos = getProfilePhotos(currentProfile);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Découvrir</h1>
          <Badge variant="secondary">
            {profiles.length - currentProfileIndex} profil{profiles.length - currentProfileIndex > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilterDialog(true)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Profile Card */}
      <div className="flex-1 px-4 pb-4">
        <Card className="relative h-full overflow-hidden">
          {/* Photo Display */}
          <div className="relative h-2/3">
            <img
              src={photos[currentPhotoIndex]}
              alt={`${currentProfile.first_name} - Photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Photo navigation */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  onClick={prevPhoto}
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  onClick={nextPhoto}
                >
                  →
                </Button>
                
                {/* Photo indicators */}
                <div className="absolute top-4 left-4 right-4 flex space-x-1">
                  {photos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-4 h-1/3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">
                {currentProfile.first_name}, {currentProfile.age}
              </h2>
              {currentProfile.is_verified && (
                <Badge variant="default" className="bg-blue-500">
                  Vérifié
                </Badge>
              )}
            </div>
            
            {currentProfile.profession && (
              <p className="text-sm text-muted-foreground mb-2">
                {currentProfile.profession}
              </p>
            )}
            
            {currentProfile.bio && (
              <p className="text-sm mb-3 line-clamp-3">
                {currentProfile.bio}
              </p>
            )}
            
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentProfile.interests.slice(0, 6).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8 p-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 border-red-500 hover:bg-red-50"
          onClick={() => handleSwipe('left')}
          disabled={isProcessing}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
          onClick={() => handleSwipe('right')}
          disabled={isProcessing}
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Ad Banner */}
      <AdBanner adUnitId="dating-discover-banner" />

      {/* Filter Dialog */}
      <EnhancedFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onFiltersApply={loadProfiles}
      />
    </div>
  );
};

export default SimplifiedSwipeInterface;