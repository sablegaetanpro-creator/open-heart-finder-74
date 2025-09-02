import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X } from 'lucide-react';
import ProfileHeader from './ProfileHeader';

interface ProfileCardProps {
  profile: any;
  onProfileClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onProfileClick }) => {
  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

  return (
    <div 
      className="w-full mb-4 cursor-pointer"
      onClick={onProfileClick}
    >
      <ProfileHeader
        firstName={profile.first_name}
        age={profile.age}
        profession={profile.profession}
        photoUrl={allPhotos[0]}
        onPhotoClick={onProfileClick}
      />
    </div>
  );
};

export default ProfileCard;