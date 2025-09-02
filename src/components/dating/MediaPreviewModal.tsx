import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MediaPreviewModalProps {
  previewMedia: {type: 'image' | 'video', url: string, file: File} | null;
  uploadProgress: number;
  isSending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  previewMedia,
  uploadProgress,
  isSending,
  onCancel,
  onConfirm
}) => {
  if (!previewMedia) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Prévisualisation</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">
          {previewMedia.type === 'image' ? (
            <img 
              src={previewMedia.url} 
              alt="Prévisualisation" 
              className="w-full h-auto max-h-64 object-contain rounded-lg"
            />
          ) : (
            <video 
              src={previewMedia.url} 
              controls 
              className="w-full h-auto max-h-64 rounded-lg"
            />
          )}
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Envoi en cours... {uploadProgress}%</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isSending}
            className="flex-1 bg-gradient-love hover:opacity-90"
          >
            {isSending ? "Envoi..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;