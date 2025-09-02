import React from 'react';
import { Button } from '@/components/ui/button';

interface ThumbnailProps {
  photos: string[];
  currentIndex: number;
  onThumbnailClick: (index: number) => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  photos,
  currentIndex,
  onThumbnailClick
}) => {
  if (photos.length <= 1) return null;

  return (
    <div className="p-4 bg-black/80">
      <div className="flex justify-center space-x-2 overflow-x-auto">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => onThumbnailClick(index)}
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
  );
};

export default Thumbnail;