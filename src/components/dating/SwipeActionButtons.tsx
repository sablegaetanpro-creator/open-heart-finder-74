import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeActionButtonsProps {
  onDislike: () => void;
  onLike: () => void;
  onSuperLike?: () => void;
  isProcessing: boolean;
}

const SwipeActionButtons: React.FC<SwipeActionButtonsProps> = ({
  onDislike,
  onLike,
  onSuperLike,
  isProcessing
}) => {
  return (
    <div className="flex justify-center items-center gap-6 py-4">
      {/* Dislike */}
      <Button
        size="lg"
        variant="outline"
        disabled={isProcessing}
        className="rounded-full w-16 h-16 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-lg"
        onClick={onDislike}
        aria-label="Passer ce profil"
      >
        <X className="w-7 h-7" />
      </Button>

      {/* Super Like */}
      {onSuperLike && (
        <Button
          size="lg"
          disabled={isProcessing}
          className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
          onClick={onSuperLike}
          aria-label="Super like"
        >
          <Zap className="w-6 h-6" />
        </Button>
      )}

      {/* Like */}
      <Button
        size="lg"
        disabled={isProcessing}
        className="rounded-full w-16 h-16 p-0 bg-gradient-love shadow-love hover:opacity-90 transition-all duration-200"
        onClick={onLike}
        aria-label="Aimer ce profil"
      >
        <Heart className="w-7 h-7 text-white fill-current" />
      </Button>
    </div>
  );
};

export default SwipeActionButtons;