import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  X, 
  Zap,
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

interface HappnProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right' | 'super', profileId: string) => void;
  showActions?: boolean;
}

const HappnProfileCard: React.FC<HappnProfileCardProps> = ({ 
  profile, 
  onSwipe, 
  showActions = true 
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

  const handleSwipe = useCallback(async (direction: 'left' | 'right' | 'super') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onSwipe(direction, profile.user_id);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [isProcessing, onSwipe, profile.user_id]);

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
    <Card className="w-full max-w-sm mx-auto bg-card border-0 overflow-hidden" style={{ boxShadow: 'none' }}>
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
              {profile.interests.slice(0, 6).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons at bottom - Happn style */}
      {showActions && (
        <div className="flex justify-center items-center gap-4 p-4 pt-0">
          {/* Dislike */}
          <Button
            size="lg"
            variant="outline"
            disabled={isProcessing}
            className="rounded-full w-14 h-14 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            onClick={() => handleSwipe('left')}
            aria-label="Passer ce profil"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Super Like */}
          <Button
            size="lg"
            disabled={isProcessing}
            className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
            onClick={() => handleSwipe('super')}
            aria-label="Super like"
          >
            <Zap className="w-5 h-5" />
          </Button>

          {/* Like */}
          <Button
            size="lg"
            disabled={isProcessing}
            className="rounded-full w-14 h-14 p-0 bg-gradient-love shadow-love hover:opacity-90 transition-all duration-200"
            onClick={() => handleSwipe('right')}
            aria-label="Aimer ce profil"
          >
            <Heart className="w-6 h-6 text-white fill-current" />
          </Button>
        </div>
      )}

      {/* Photo Gallery Modal */}
      <PhotoGallery
        photos={allPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        onIndexChange={setCurrentPhotoIndex}
        profileName={profile.first_name}
      />
    </Card>
  );
};

export default HappnProfileCard;