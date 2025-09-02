import React from 'react';
import { Heart, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { offlineDataManager } from '@/lib/offlineDataManager';

interface SwipeButtonsProps {
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  isProcessing: boolean;
}

const SwipeButtons: React.FC<SwipeButtonsProps> = ({ onSwipe, isProcessing }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSuperLike = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour utiliser cette fonctionnalité",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si l'utilisateur a des super likes disponibles
    // Pour l'instant, on autorise toujours (mode gratuit)
    onSwipe('super');
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-20 bg-transparent">
      <div className="flex justify-center items-center gap-6 py-4">
        {/* Dislike */}
        <Button
          size="lg"
          variant="outline"
          disabled={isProcessing}
          className="rounded-full w-16 h-16 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-lg"
          onClick={() => onSwipe('left')}
          aria-label="Passer ce profil"
        >
          <X className="w-7 h-7" />
        </Button>

        {/* Super Like */}
        <Button
          size="lg"
          disabled={isProcessing}
          className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
          onClick={handleSuperLike}
          aria-label="Super like"
        >
          <Zap className="w-6 h-6" />
        </Button>

        {/* Like */}
        <Button
          size="lg"
          disabled={isProcessing}
          className="rounded-full w-16 h-16 p-0 bg-gradient-love shadow-love hover:opacity-90 transition-all duration-200"
          onClick={() => onSwipe('right')}
          aria-label="Aimer ce profil"
        >
          <Heart className="w-7 h-7 text-white fill-current" />
        </Button>
      </div>
    </div>
  );
};

export default SwipeButtons;