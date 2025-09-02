import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface RemoveLikeButtonProps {
  onRemoveLike: () => void;
  isProcessing: boolean;
}

const RemoveLikeButton: React.FC<RemoveLikeButtonProps> = ({ onRemoveLike, isProcessing }) => {
  return (
    <div className="p-4 bg-background border-t border-border/10">
      <div className="max-w-sm mx-auto">
        <Button
          onClick={onRemoveLike}
          disabled={isProcessing}
          variant="destructive"
          className="w-full flex items-center justify-center"
          size="lg"
        >
          <X className="w-5 h-5 mr-2" />
          {isProcessing ? "Suppression..." : "Retirer le like"}
        </Button>
      </div>
    </div>
  );
};

export default RemoveLikeButton;