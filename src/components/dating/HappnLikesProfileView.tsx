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
    
    console.log('🔄 Démarrage de la suppression du like pour:', profile.first_name, profile.user_id);
    setIsProcessing(true);
    try {
      // Use the new function to properly remove like and associated match
      const { data, error } = await supabase
        .rpc('remove_user_like', {
          p_swiper_id: user.id,
          p_swiped_id: profile.user_id
        });

      console.log('📊 Résultat de remove_user_like:', { data, error });

      if (error) {
        console.error('❌ Erreur SQL:', error);
        throw error;
      }

      if ((data as any)?.success) {
        console.log('✅ Like supprimé avec succès:', data);
        
        // Remove from local database immediately
        await (window as any).offlineDb?.swipes
          ?.where('swiper_id').equals(user.id)
          .and((swipe: any) => swipe.swiped_id === profile.user_id && swipe.is_like === true)
          .delete();

        // Also remove any associated matches from local database
        await (window as any).offlineDb?.matches
          ?.where(['user1_id', 'user2_id']).anyOf([
            [user.id, profile.user_id],
            [profile.user_id, user.id]
          ])
          .delete();

        console.log('🗄️ Suppression des données locales terminée');

        // Trigger data refresh
        window.dispatchEvent(new CustomEvent('refresh-data'));
        
        toast({
          title: "✅ Like retiré avec succès",
          description: `${profile.first_name} retournera dans Découvrir`,
          duration: 4000
        });

        // Call the callback to handle navigation and refresh
        onRemoveLike(profile.user_id);
        onBack();
      } else {
        console.log('⚠️ Pas de like trouvé à supprimer:', data);
        toast({
          title: "Information",
          description: (data as any)?.message || "Aucun like trouvé à retirer",
          duration: 3000
        });
      }
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
      <div className="flex items-center justify-between p-4 bg-background border-b border-border/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-lg font-semibold">Profil liké</h1>
        <div className="w-16" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto p-4">
          {/* Happn Style Profile Card */}
          <Card className="w-full bg-card border-0 shadow-card overflow-hidden">
            {/* Header with name and age - Happn style */}
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile.first_name}
                  </h2>
                  <p className="text-lg text-muted-foreground">{profile.age} ans</p>
                </div>
                {profile.profession && (
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="text-sm truncate max-w-[100px]">{profile.profession}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Large centered photo - Happn style */}
            <div className="relative">
              <div className="aspect-[3/4] w-full">
                <img
                  src={allPhotos[currentPhotoIndex]}
                  alt={profile.first_name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowPhotoGallery(true)}
                  loading="lazy"
                />
                
                {/* Photo Gallery Indicator */}
                <div className="absolute top-3 right-3 bg-black/40 rounded-full p-1.5">
                  <Expand className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Photo Navigation Dots */}
              {allPhotos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {allPhotos.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info tags below photo - Happn style */}
            <div className="p-4 space-y-3">
              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-foreground leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Info Tags */}
              <div className="flex flex-wrap gap-2">
                {profile.height && (
                  <Badge variant="secondary" className="text-xs">
                    📏 {profile.height} cm
                  </Badge>
                )}
                
                {profile.education && (
                  <Badge variant="secondary" className="text-xs flex items-center">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {profile.education}
                  </Badge>
                )}
                
                {profile.exercise_frequency && (
                  <Badge variant="secondary" className="text-xs flex items-center">
                    <Dumbbell className="w-3 h-3 mr-1" />
                    {profile.exercise_frequency}
                  </Badge>
                )}

                {profile.children && getChildrenIcon(profile.children) && (
                  <Badge variant="secondary" className="text-xs flex items-center">
                    {getChildrenIcon(profile.children)}
                    <span className="ml-1">{profile.children}</span>
                  </Badge>
                )}
                
                {profile.animals && getAnimalsIcon(profile.animals) && (
                  <Badge variant="secondary" className="text-xs flex items-center">
                    {getAnimalsIcon(profile.animals)}
                    <span className="ml-1">{profile.animals}</span>
                  </Badge>
                )}
                
                {profile.smoker && (
                  <Badge variant="secondary" className="text-xs flex items-center">
                    <Cigarette className="w-3 h-3 mr-1" />
                    Fumeur
                  </Badge>
                )}
                
                {profile.drinks && (
                  <Badge variant="secondary" className="text-xs flex items-center">
                    <Wine className="w-3 h-3 mr-1" />
                    {profile.drinks}
                  </Badge>
                )}
              </div>

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Centres d'intérêt</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Photos Grid */}
              {allPhotos.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Photos supplémentaires</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {allPhotos.slice(1).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${profile.first_name} ${index + 2}`}
                        className="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setCurrentPhotoIndex(index + 1)}
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Remove Like Button - Fixed at bottom */}
      <div className="p-4 bg-background border-t border-border/10">
        <div className="max-w-sm mx-auto">
          <Button
            onClick={handleRemoveLike}
            disabled={isProcessing}
            variant="destructive"
            className="w-full flex items-center justify-center"
            size="lg"
          >
            <X className="w-5 h-5 mr-2" />
            {isProcessing ? "Suppression..." : "Retirer le like"}
          </Button>
        </div>
      </div>

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