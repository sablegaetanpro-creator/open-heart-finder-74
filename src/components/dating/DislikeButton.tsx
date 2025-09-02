import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DislikeButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

const DislikeButton: React.FC<DislikeButtonProps> = ({ onClick, isProcessing }) => {
  return (
    <div className="flex justify-center items-center py-4">
      <Button
        size="lg"
        variant="outline"
        className="rounded-full w-16 h-16 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={onClick}
        aria-label="Fermer"
        disabled={isProcessing}
      >
        <X className="w-7 h-7" />
      </Button>
    </div>
  );
};

export default DislikeButton;