import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
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

interface GivenLikesVerticalCardProps {
  profile: Profile;
  onRemoveLike: (profileId: string) => void;
  isProcessing: boolean;
}

const GivenLikesVerticalCard: React.FC<GivenLikesVerticalCardProps> = ({
  profile,
  onRemoveLike,
  isProcessing
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  
  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

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
    <Card className="w-full bg-card border-0 overflow-hidden shadow-lg">
      <div className="flex flex-col">
        {/* Photo Section */}
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
          
          {/* Photo Navigation Indicators */}
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

          {/* Swipe Action Buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button
              onClick={() => onRemoveLike(profile.user_id)}
              disabled={isProcessing}
              size="lg"
              variant="destructive"
              className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {profile.first_name}, {profile.age}
              </h3>
              {profile.profession && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profile.profession}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {profile.bio}
            </p>
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

            {profile.children && getChildrenIcon(profile.children) && (
              <div className="flex items-center">
                {getChildrenIcon(profile.children)}
                <span className="ml-1 truncate">{profile.children}</span>
              </div>
            )}
            
            {profile.animals && getAnimalsIcon(profile.animals) && (
              <div className="flex items-center">
                {getAnimalsIcon(profile.animals)}
                <span className="ml-1 truncate">{profile.animals}</span>
              </div>
            )}
            
            {profile.smoker && (
              <div className="flex items-center">
                <Cigarette className="w-3 h-3 mr-1" />
                <span>Fumeur</span>
              </div>
            )}
            
            {profile.drinks && (
              <div className="flex items-center">
                <Wine className="w-3 h-3 mr-1" />
                <span className="truncate">{profile.drinks}</span>
              </div>
            )}
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.interests.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
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
    </Card>
  );
};

export default GivenLikesVerticalCard;