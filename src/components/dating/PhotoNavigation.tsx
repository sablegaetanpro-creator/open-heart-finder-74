import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoNavigationProps {
  currentIndex: number;
  totalPhotos: number;
  onPrev: () => void;
  onNext: () => void;
}

const PhotoNavigation: React.FC<PhotoNavigationProps> = ({
  currentIndex,
  totalPhotos,
  onPrev,
  onNext
}) => {
  if (totalPhotos <= 1) return null;

  return (
    <>
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0"
          onClick={onPrev}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}
      
      {currentIndex < totalPhotos - 1 && (
        <Button
          variant="ghost"
          size="lg"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 p-0"
          onClick={onNext}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}
    </>
  );
};

export default PhotoNavigation;