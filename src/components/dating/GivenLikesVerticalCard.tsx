import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import DislikeProfileButton from './DislikeProfileButton';
import PhotoGalleryIndicator from './PhotoGalleryIndicator';
import PhotoNavigationIndicators from './PhotoNavigationIndicators';
import ProfileInfoSection from './ProfileInfoSection';

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
            <PhotoGalleryIndicator onClick={() => setShowPhotoGallery(true)} />
          </div>
          
          {/* Photo Navigation Indicators */}
          <PhotoNavigationIndicators 
            photos={allPhotos} 
            currentIndex={currentPhotoIndex} 
          />

          {/* Swipe Action Buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <DislikeProfileButton 
              onRemoveLike={() => onRemoveLike(profile.user_id)} 
              isProcessing={isProcessing} 
            />
          </div>
        </div>

        {/* Profile Info Section */}
        <ProfileInfoSection profile={profile} />
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