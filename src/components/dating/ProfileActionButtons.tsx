import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, Zap } from 'lucide-react';

interface ProfileActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
  isProcessing: boolean;
}

const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  onLike,
  onDislike,
  onSuperLike,
  isProcessing
}) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      {/* Dislike */}
      <Button
        size="lg"
        variant="outline"
        disabled={isProcessing}
        className="rounded-full w-14 h-14 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-lg"
        onClick={onDislike}
        aria-label="Passer ce profil"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Super Like */}
      {onSuperLike && (
        <Button
          size="lg"
          disabled={isProcessing}
          className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
          onClick={onSuperLike}
          aria-label="Super like"
        >
          <Zap className="w-5 h-5" />
        </Button>
      )}

      {/* Like */}
      <Button
        size="lg"
        disabled={isProcessing}
        className="rounded-full w-14 h-14 p-0 bg-gradient-love shadow-love hover:opacity-90 transition-all duration-200"
        onClick={onLike}
        aria-label="Aimer ce profil"
      >
        <Heart className="w-6 h-6 text-white fill-current" />
      </Button>
    </div>
  );
};

export default ProfileActionButtons;