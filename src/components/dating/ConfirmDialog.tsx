import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Supprimer",
  cancelText = "Annuler",
  isProcessing = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirmation pour {title.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Suppression..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;