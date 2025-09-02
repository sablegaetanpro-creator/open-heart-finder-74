import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  firstName: string;
  age: number;
  profession?: string;
  photoUrl: string;
  onPhotoClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  age,
  profession,
  photoUrl,
  onPhotoClick
}) => {
  return (
    <div className="w-full mb-4">
      <Card className="overflow-hidden shadow-xl border-0">
        <div className="relative aspect-[3/4]">
          <img
            src={photoUrl}
            alt={`${firstName} - Photo principale`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={onPhotoClick}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold">
              {firstName}, {age}
            </h2>
            {profession && (
              <p className="text-sm text-white/90 mt-1">{profession}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileHeader;