import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  X, 
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

interface VerticalProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
}

const VerticalProfileCard: React.FC<VerticalProfileCardProps> = ({ profile, onSwipe }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onSwipe(direction, profile.user_id);
    } finally {
      // Add a small delay to prevent rapid clicking
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [isProcessing, onSwipe, profile.user_id]);

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
    <div className="relative">
      {/* Fixed Action Buttons - Always Visible */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center">
        <Button
          size="lg"
          variant="outline"
          disabled={isProcessing}
          className="ml-2 rounded-full w-12 h-12 p-0 border-2 border-destructive bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground shadow-lg"
          onClick={() => handleSwipe('left')}
          aria-label="Passer ce profil"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 z-20 flex items-center">
        <Button
          size="lg"
          disabled={isProcessing}
          className="mr-2 rounded-full w-12 h-12 p-0 bg-gradient-love shadow-love hover:opacity-90 shadow-lg"
          onClick={() => handleSwipe('right')}
          aria-label="Aimer ce profil"
        >
          <Heart className="w-5 h-5 text-white fill-current" />
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="w-full bg-card border-0 overflow-hidden mx-16"> {/* Margin to avoid overlap with buttons */}
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

export default VerticalProfileCard;