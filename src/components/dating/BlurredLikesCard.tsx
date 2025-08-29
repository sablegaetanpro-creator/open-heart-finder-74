import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Play, Sparkles } from 'lucide-react';

interface BlurredLikesCardProps {
  profile: {
    first_name: string;
    age: number;
    profile_photo_url: string;
  };
  onReveal: () => void;
  onWatchAd: () => void;
  isRevealed?: boolean;
}

const BlurredLikesCard: React.FC<BlurredLikesCardProps> = ({
  profile,
  onReveal,
  onWatchAd,
  isRevealed = false
}) => {
  if (isRevealed) {
    return null; // This card should be replaced with actual profile card
  }

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-primary/5 to-message/5 border border-primary/20">
      <div className="relative">
        {/* Blurred Profile Image */}
        <div className="aspect-[4/5] w-full relative overflow-hidden">
          <img
            src={profile.profile_photo_url}
            alt="Profil flouté"
            className="w-full h-full object-cover filter blur-lg scale-110"
          />
          
          {/* Overlay with mystery effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          
          {/* Heart icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Sparkles className="w-10 h-10 text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Profile Info - Partially Hidden */}
        <div className="p-4 space-y-3">
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">
              {profile.first_name.charAt(0)}***, {profile.age} ans
            </h3>
            <p className="text-sm text-muted-foreground">
              Quelqu'un vous a liké ! 💕
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onWatchAd}
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Regarder une pub pour révéler
            </Button>
            
            <Button
              onClick={onReveal}
              className="w-full bg-gradient-primary text-white hover:opacity-90"
            >
              <Eye className="w-4 h-4 mr-2" />
              Débloquer Premium
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Découvrez qui vous trouve attirant(e) !
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BlurredLikesCard;