import React from 'react';
import { Card } from '@/components/ui/card';

interface PhotoNavigationIndicatorsProps {
  photos: string[];
  currentIndex: number;
}

const PhotoNavigationIndicators: React.FC<PhotoNavigationIndicatorsProps> = ({
  photos,
  currentIndex
}) => {
  if (photos.length <= 1) return null;

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-center space-x-1">
      {photos.map((_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 mx-0.5 rounded-full ${
            index === currentIndex ? 'bg-white' : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  );
};

export default PhotoNavigationIndicators;