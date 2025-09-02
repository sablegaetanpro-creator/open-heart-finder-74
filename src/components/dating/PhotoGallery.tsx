import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import CloseButton from './CloseButton';
import PhotoNavigation from './PhotoNavigation';
import Thumbnail from './Thumbnail';

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
            <PhotoNavigation
              currentIndex={currentIndex}
              totalPhotos={photos.length}
              onPrev={prevPhoto}
              onNext={nextPhoto}
            />

            {/* Bouton fermer */}
            <CloseButton onClick={onClose} />
          </div>

          {/* Miniatures */}
          <Thumbnail
            photos={photos}
            currentIndex={currentIndex}
            onThumbnailClick={goToPhoto}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoGallery;