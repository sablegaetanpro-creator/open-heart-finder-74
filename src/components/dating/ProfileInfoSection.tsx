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
  Wine
} from 'lucide-react';

interface ProfileInfoSectionProps {
  profile: any;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ profile }) => {
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
  );
};

export default ProfileInfoSection;