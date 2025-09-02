import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface ProfileEditButtonProps {
  onEditClick: () => void;
}

const ProfileEditButton: React.FC<ProfileEditButtonProps> = ({ onEditClick }) => {
  return (
    <Button
      variant="ghost" 
      size="icon"
      onClick={onEditClick}
    >
      <Edit className="w-5 h-5" />
    </Button>
  );
};

export default ProfileEditButton;