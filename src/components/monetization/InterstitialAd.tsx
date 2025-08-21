import React, { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  type?: 'video' | 'static';
  duration?: number; // in seconds
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({
  isOpen,
  onClose,
  onComplete,
  type = 'video',
  duration = 5
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [canClose, setCanClose] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      setCanClose(false);
      setIsPlaying(false);
      return;
    }

    if (type === 'static') {
      // For static ads, allow immediate close
      setCanClose(true);
      return;
    }

    // For video ads, start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, duration, type, onComplete]);

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // In a real implementation, this would start the video
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="relative w-full max-w-md bg-background">
        {/* Close button - only visible when allowed */}
        {canClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Timer indicator */}
        {!canClose && type === 'video' && (
          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
            {timeLeft}s
          </div>
        )}

        <div className="p-6">
          {/* Ad Content */}
          {type === 'video' ? (
            <div className="space-y-4">
              {/* Video placeholder */}
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                {!isPlaying ? (
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={handlePlay}
                  >
                    <Play className="w-8 h-8 text-white" />
                  </Button>
                ) : (
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">🎉</div>
                    <div className="text-lg font-semibold">Découvrez notre app Premium !</div>
                    <div className="text-sm opacity-80 mt-2">
                      Plus de matches, moins de publicités
                    </div>
                  </div>
                )}
              </div>

              {/* Ad info */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Publicité</div>
                <div className="text-sm font-medium">
                  Augmentez vos chances de match !
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Static ad content */}
              <div className="aspect-[4/3] bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-center p-6">
                <div>
                  <div className="text-3xl mb-4">💝</div>
                  <div className="text-xl font-bold mb-2">
                    Trouvez l'amour plus vite !
                  </div>
                  <div className="text-sm opacity-90">
                    Passez à Premium et multipliez vos chances
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">Publicité</div>
                <Button 
                  className="w-full bg-gradient-love hover:opacity-90"
                  onClick={() => {
                    // Handle premium upgrade
                    if (onComplete) onComplete();
                    onClose();
                  }}
                >
                  Essayer Premium
                </Button>
              </div>
            </div>
          )}

          {/* Progress bar for video ads */}
          {type === 'video' && isPlaying && (
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${((duration - timeLeft) / duration) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InterstitialAd;