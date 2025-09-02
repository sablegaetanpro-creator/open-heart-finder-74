import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface LikeBackButtonProps {
  onLikeBack: () => void;
  isProcessing: boolean;
}

const LikeBackButton: React.FC<LikeBackButtonProps> = ({ onLikeBack, isProcessing }) => {
  return (
    <Button
      onClick={onLikeBack}
      disabled={isProcessing}
      className="w-full mt-4"
    >
      <Heart className="w-4 h-4 mr-2" />
      Liker en retour
    </Button>
  );
};

export default LikeBackButton;