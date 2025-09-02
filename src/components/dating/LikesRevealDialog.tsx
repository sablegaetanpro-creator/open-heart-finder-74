import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface LikesRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWatchAd: () => void;
  onPayToReveal: () => void;
}

const LikesRevealDialog: React.FC<LikesRevealDialogProps> = ({
  open,
  onOpenChange,
  onWatchAd,
  onPayToReveal
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Découvrir qui vous a liké</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Pour voir qui vous a liké, vous pouvez soit regarder une publicité, soit payer pour supprimer les pubs.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={onWatchAd} className="flex items-center justify-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Regarder une pub</span>
            </Button>
            <Button variant="outline" onClick={onPayToReveal}>
              Payer 2.99€
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikesRevealDialog;