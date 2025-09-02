import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  X, 
  ArrowLeft,
  MapPin, 
  Briefcase, 
  GraduationCap,
  Dumbbell,
  Baby,
  PawPrint,
  Cigarette,
  Wine,
  Expand
} from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BackButtonHeader from './BackButtonHeader';
import RemoveLikeButton from './RemoveLikeButton';
import HappnProfileCard from './HappnProfileCard';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  profile_photo_url: string;
  additional_photos?: string[];
  bio?: string;
  profession?: string;
  interests?: string[];
  height?: number;
  education?: string;
  exercise_frequency?: string;
  children?: string;
  animals?: string;
  smoker?: boolean;
  drinks?: string;
}

interface HappnLikesProfileViewProps {
  profile: Profile;
  onBack: () => void;
  onRemoveLike: (profileId: string) => void;
}

const HappnLikesProfileView: React.FC<HappnLikesProfileViewProps> = ({ 
  profile, 
  onBack, 
  onRemoveLike 
}) => {
  const { user } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

  const handleRemoveLike = useCallback(async () => {
    if (isProcessing || !user) return;
    
    // start remove like
    setIsProcessing(true);
    try {
      // Suppression du swipe dans Supabase
      const { error: supabaseError } = await supabase
        .from('swipes')
        .delete()
        .eq('swiper_id', user.id)
        .eq('swiped_id', profile.user_id);

      if (supabaseError) {
        console.error('❌ Erreur SQL Supabase:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Swipe supprimé de Supabase');

      // Suppression locale aussi
      const localSwipes = await offlineDataManager.getUserSwipes(user.id);
      const swipeToDelete = localSwipes.find(swipe => 
        swipe.swiper_id === user.id && swipe.swiped_id === profile.user_id
      );

      if (swipeToDelete) {
        await offlineDataManager.deleteSwipe(swipeToDelete.id);
        console.log('✅ Swipe supprimé localement');
      }

      // Suppression réussie
      toast({
        title: "✅ Like retiré avec succès",
        description: `${profile.first_name} retournera dans Découvrir`,
        duration: 4000
      });

      // Call the callback to handle navigation and refresh
      onRemoveLike(profile.user_id);
      onBack();
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression du like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le like. Veuillez réessayer.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, user, profile.user_id, onRemoveLike, onBack]);

  const getChildrenIcon = (children: string) => {
    switch (children) {
      case 'veut_enfants':
      case 'a_enfants':
        return <Baby className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAnimalsIcon = (animals: string) => {
    switch (animals) {
      case 'aime_animaux':
      case 'a_animaux':
        return <PawPrint className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header with Back Button */}
      <BackButtonHeader onBack={onBack} title="Profil liké" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto p-4">
          {/* Happn Style Profile Card */}
          <HappnProfileCard
            profile={profile}
            allPhotos={allPhotos}
            currentPhotoIndex={currentPhotoIndex}
            onPhotoClick={() => setShowPhotoGallery(true)}
            onThumbnailClick={setCurrentPhotoIndex}
            onRemoveLike={handleRemoveLike}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Remove Like Button - Fixed at bottom */}
      <RemoveLikeButton 
        onRemoveLike={handleRemoveLike} 
        isProcessing={isProcessing} 
      />

      {/* Photo Gallery Modal */}
      <PhotoGallery
        photos={allPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        onIndexChange={setCurrentPhotoIndex}
        profileName={profile.first_name}
      />
    </div>
  );
};

export default HappnLikesProfileView;