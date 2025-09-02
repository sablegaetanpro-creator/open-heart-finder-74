import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DislikeProfileButtonProps {
  onRemoveLike: (profileId: string) => void;
  isProcessing: boolean;
}

const DislikeProfileButton: React.FC<DislikeProfileButtonProps> = ({
  onRemoveLike,
  isProcessing
}) => {
  return (
    <Button
      onClick={() => onRemoveLike}
      disabled={isProcessing}
      size="lg"
      variant="destructive"
      className="w-full flex items-center justify-center"
    >
      <X className="w-5 h-5 mr-2" />
      {isProcessing ? "Suppression..." : "Retirer le like"}
    </Button>
  );
};

export default DislikeProfileButton;