import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface UserProfileHeaderProps {
  otherUser: {
    name: string;
    age: number;
    avatar: string;
  };
  onShowProfile: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  otherUser,
  onShowProfile
}) => {
  return (
    <div className="flex items-center space-x-3 cursor-pointer" onClick={onShowProfile}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
        <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold text-foreground">{otherUser.name}</h3>
        <p className="text-xs text-muted-foreground">{otherUser.age} ans</p>
      </div>
    </div>
  );
};

export default UserProfileHeader;