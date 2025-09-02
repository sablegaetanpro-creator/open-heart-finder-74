import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand } from 'lucide-react';

interface PhotoGalleryIndicatorProps {
  onClick: () => void;
}

const PhotoGalleryIndicator: React.FC<PhotoGalleryIndicatorProps> = ({ onClick }) => {
  return (
    <div 
      className="absolute top-4 right-4 bg-black/30 rounded-full p-1 cursor-pointer"
      onClick={onClick}
    >
      <Expand className="w-4 h-4 text-white" />
    </div>
  );
};

export default PhotoGalleryIndicator;