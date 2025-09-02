import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface MatchButtonProps {
  onMatchClick: () => void;
}

const MatchButton: React.FC<MatchButtonProps> = ({ onMatchClick }) => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onMatchClick();
      }}
    >
      Profil
    </Button>
  );
};

export default MatchButton;