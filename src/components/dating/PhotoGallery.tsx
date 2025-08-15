import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  profileName: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  profileName
}) => {
  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const goToPhoto = (index: number) => {
    onIndexChange(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden bg-black/95">
        <DialogHeader className="sr-only">
          <DialogTitle>Photos de {profileName}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-full flex flex-col">
          {/* Photo principale */}
          <div className="relative flex-1 flex items-center justify-center min-h-[60vh]">
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1} de ${profileName}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation précédent/suivant */}
            {photos.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                )}
                
                {currentIndex < photos.length - 1 && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                )}
              </>
            )}

            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Miniatures */}
          {photos.length > 1 && (
            <div className="p-4 bg-black/80">
              <div className="flex justify-center space-x-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-primary ring-2 ring-primary/50' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Indicateur */}
              <div className="text-center mt-2 text-white/70 text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoGallery;