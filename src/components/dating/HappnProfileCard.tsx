import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
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
import PhotoGalleryIndicator from './PhotoGalleryIndicator';
import PhotoNavigationIndicators from './PhotoNavigationIndicators';
import ProfileInfoSection from './ProfileInfoSection';

interface HappnProfileCardProps {
  profile: any;
  allPhotos: string[];
  currentPhotoIndex: number;
  onPhotoClick: () => void;
  onThumbnailClick: (index: number) => void;
  onRemoveLike: () => void;
  isProcessing: boolean;
}

const HappnProfileCard: React.FC<HappnProfileCardProps> = ({
  profile,
  allPhotos,
  currentPhotoIndex,
  onPhotoClick,
  onThumbnailClick,
  onRemoveLike,
  isProcessing
}) => {
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
            onClick={onPhotoClick}
            loading="lazy"
          />
          
          {/* Photo Gallery Indicator */}
          <PhotoGalleryIndicator onClick={onPhotoClick} />
        </div>
        
        {/* Photo Navigation Dots */}
        <PhotoNavigationIndicators 
          photos={allPhotos} 
          currentIndex={currentPhotoIndex} 
        />
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
                  onClick={() => onThumbnailClick(index + 1)}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HappnProfileCard;