import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Edit } from 'lucide-react';

interface ProfileSummaryProps {
  profile: any;
  onEditClick: () => void;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ profile, onEditClick }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-20 h-20 border-2 border-primary/20">
          <AvatarImage src={profile.profile_photo_url} alt={profile.first_name} />
          <AvatarFallback className="text-xl">
            {profile.first_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-foreground">
            {profile.first_name}, {profile.age}
          </h2>
          {profile.profession && (
            <div className="flex items-center text-muted-foreground mt-1">
              <Briefcase className="w-4 h-4 mr-1" />
              <span className="text-sm">{profile.profession}</span>
            </div>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {profile.bio}
            </p>
          )}
        </div>
        
        <Button
          variant="ghost" 
          size="icon"
          onClick={onEditClick}
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};

export default ProfileSummary;