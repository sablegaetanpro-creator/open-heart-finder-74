import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Eye } from 'lucide-react';

interface RevealLikesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWatchAd: () => void;
  onPayToReveal: () => void;
  hiddenLikesCount: number;
}

const RevealLikesDialog: React.FC<RevealLikesDialogProps> = ({
  open,
  onOpenChange,
  onWatchAd,
  onPayToReveal,
  hiddenLikesCount
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Voir les likes
          </DialogTitle>
          <DialogDescription>
            Découvrez qui vous a liké ! Regardez une pub ou payez pour débloquer immédiatement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {hiddenLikesCount} personne{hiddenLikesCount > 1 ? 's' : ''} vous {hiddenLikesCount > 1 ? 'ont' : 'a'} liké !
          </p>
          <div className="flex flex-col space-y-3">
            <Button onClick={onWatchAd} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Regarder une pub (Gratuit)
            </Button>
            <Button onClick={onPayToReveal} variant="outline" className="w-full">
              Payer 0.99€ (Sans pub)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevealLikesDialog;