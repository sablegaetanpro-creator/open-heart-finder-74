import React from 'react';
import { Card } from '@/components/ui/card';

interface PhotoGridProps {
  photos: string[];
  startIndex: number;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, startIndex }) => {
  if (photos.length <= startIndex) return null;

  const remainingPhotos = photos.slice(startIndex);

  return (
    <>
      {remainingPhotos.map((photo, index) => (
        <div key={`photo-${startIndex + index}`} className="w-full mb-4">
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="aspect-[3/4]">
              <img 
                src={photo} 
                alt={`Photo ${startIndex + index + 1}`} 
                className="w-full h-full object-cover" 
                loading="lazy" 
              />
            </div>
          </Card>
        </div>
      ))}
    </>
  );
};

export default PhotoGrid;