import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Eye } from 'lucide-react';
import BlurredLikesCard from './BlurredLikesCard';
import PaymentDialog from '@/components/monetization/PaymentDialog';

interface GivenLikesBlurDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Array<{
    id: string;
    first_name: string;
    age: number;
    profile_photo_url: string;
  }>;
  onProfileSelect: (profile: any) => void;
}

const GivenLikesBlurDialog: React.FC<GivenLikesBlurDialogProps> = ({
  isOpen,
  onOpenChange,
  profiles,
  onProfileSelect
}) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [revealedProfiles, setRevealedProfiles] = useState<Set<string>>(new Set());

  const handleWatchAd = (profileId: string) => {
    // Simulate watching an ad - in real app, integrate with AdMob
    setTimeout(() => {
      setRevealedProfiles(prev => new Set([...prev, profileId]));
    }, 3000);
  };

  const handleRevealAll = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setRevealedProfiles(new Set(profiles.map(p => p.id)));
    setShowPaymentDialog(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Likes donnés ({profiles.length})
            </DialogTitle>
          </DialogHeader>

          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Vous n'avez liké personne pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Découvrez qui vous avez liké !
                </p>
              </div>

              {/* Premium Unlock All Button */}
              <Button
                onClick={handleRevealAll}
                className="w-full bg-gradient-primary text-white hover:opacity-90 mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Débloquer tous les profils - Premium
              </Button>

              {/* Profile Cards */}
              <div className="grid grid-cols-2 gap-3">
                {profiles.map((profile) => {
                  const isRevealed = revealedProfiles.has(profile.id);
                  
                  if (isRevealed) {
                    return (
                      <div
                        key={profile.id}
                        className="aspect-[3/4] relative cursor-pointer group"
                        onClick={() => onProfileSelect(profile)}
                      >
                        <img
                          src={profile.profile_photo_url}
                          alt={profile.first_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-medium">
                            {profile.first_name}, {profile.age}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <BlurredLikesCard
                      key={profile.id}
                      profile={profile}
                      onReveal={handleRevealAll}
                      onWatchAd={() => handleWatchAd(profile.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
        feature="reveal_likes"
      />
    </>
  );
};

export default GivenLikesBlurDialog;