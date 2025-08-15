import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  X, 
  ArrowLeft,
  MapPin, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
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

interface GivenLikesProfileViewProps {
  profile: Profile;
  onBack: () => void;
  onRemoveLike: (profileId: string) => void;
}

const GivenLikesProfileView: React.FC<GivenLikesProfileViewProps> = ({ 
  profile, 
  onBack, 
  onRemoveLike 
}) => {
  const { user } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

  const handleRemoveLike = useCallback(async () => {
    if (isProcessing || !user) return;
    
    setIsProcessing(true);
    try {
      console.log('🔄 Démarrage de la suppression du like pour:', profile.first_name, profile.user_id);
      
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
  }, [isProcessing, user, profile, onRemoveLike, onBack]);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < allPhotos.length - 1 ? prev + 1 : prev
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

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
    <div className="flex-1 flex flex-col">
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
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Profile Card */}
          <Card className="w-full bg-card border-0 overflow-hidden">
            <div className="flex flex-col">
              {/* Profile Info Section - Above Photo */}
              <div className="bg-background p-4 border-b border-border/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile.first_name}, {profile.age}
                    </h2>
                    {profile.profession && (
                      <div className="flex items-center text-muted-foreground mt-1">
                        <Briefcase className="w-4 h-4 mr-1" />
                        <span className="text-sm">{profile.profession}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? '▲' : '▼'}
                  </Button>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {profile.height && (
                    <div className="flex items-center">
                      <span className="mr-1">📏</span>
                      <span>{profile.height} cm</span>
                    </div>
                  )}
                  
                  {profile.education && (
                    <div className="flex items-center">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      <span className="truncate max-w-[100px]">{profile.education}</span>
                    </div>
                  )}
                  
                  {profile.exercise_frequency && (
                    <div className="flex items-center">
                      <Dumbbell className="w-3 h-3 mr-1" />
                      <span className="truncate">{profile.exercise_frequency}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Section - Below Profile Info */}
              <div className="relative">
                <div className="aspect-[4/5] w-full">
                  <img
                    src={allPhotos[currentPhotoIndex]}
                    alt={profile.first_name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowPhotoGallery(true)}
                    loading="lazy"
                  />
                  
                  {/* Photo Gallery Indicator */}
                  <div className="absolute top-4 right-4 bg-black/30 rounded-full p-1">
                    <Expand className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Photo Navigation - No Arrow Overlays */}
                {allPhotos.length > 1 && (
                  <div className="absolute top-4 left-4 right-4 flex justify-center space-x-1">
                    {allPhotos.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 mx-0.5 rounded-full ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Details Section */}
              {showDetails && (
                <div className="bg-background p-4 border-t border-border/10">
                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {profile.children && getChildrenIcon(profile.children) && (
                      <div className="flex items-center text-sm">
                        {getChildrenIcon(profile.children)}
                        <span className="ml-2 truncate">{profile.children}</span>
                      </div>
                    )}
                    
                    {profile.animals && getAnimalsIcon(profile.animals) && (
                      <div className="flex items-center text-sm">
                        {getAnimalsIcon(profile.animals)}
                        <span className="ml-2 truncate">{profile.animals}</span>
                      </div>
                    )}
                    
                    {profile.smoker && (
                      <div className="flex items-center text-sm">
                        <Cigarette className="w-4 h-4 text-muted-foreground" />
                        <span className="ml-2">Fumeur</span>
                      </div>
                    )}
                    
                    {profile.drinks && (
                      <div className="flex items-center text-sm">
                        <Wine className="w-4 h-4 text-muted-foreground" />
                        <span className="ml-2 truncate">{profile.drinks}</span>
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Centres d'intérêt</h3>
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Photos Grid */}
                  {allPhotos.length > 1 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Photos supplémentaires</h3>
                      <div className="grid grid-cols-4 gap-2">
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
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Remove Like Button - Fixed at bottom */}
      <div className="p-4 bg-background border-t border-border/10">
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

export default GivenLikesProfileView;