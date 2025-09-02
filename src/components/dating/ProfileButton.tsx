import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface ProfileButtonProps {
  onProfileClick: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onProfileClick }) => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onProfileClick();
      }}
    >
      Profil
    </Button>
  );
};

export default ProfileButton;