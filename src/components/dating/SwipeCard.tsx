import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location: string;
  profession: string;
  interests: string[];
  bio: string;
}

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
  style?: React.CSSProperties;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, style }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onSwipe('right', profile.id);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', profile.id);
    }
  };

  const handleLike = () => {
    onSwipe('right', profile.id);
  };

  const handlePass = () => {
    onSwipe('left', profile.id);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < profile.photos.length - 1 ? prev + 1 : 0
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : profile.photos.length - 1
    );
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ x, rotate, opacity, ...style }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative h-full w-full bg-gradient-card rounded-3xl shadow-card overflow-hidden border border-border/10">
        {/* Photo Section */}
        <div className="relative h-2/3 overflow-hidden">
          <img
            src={profile.photos[currentPhotoIndex]}
            alt={`${profile.name} photo ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Navigation Dots */}
          {profile.photos.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {profile.photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Photo Navigation Areas */}
          <div className="absolute inset-0 flex">
            <div 
              className="w-1/2 h-full" 
              onClick={prevPhoto}
            />
            <div 
              className="w-1/2 h-full" 
              onClick={nextPhoto}
            />
          </div>

          {/* Swipe Indicators */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(x, [50, 100], [0, 1]) }}
          >
            <div className="bg-like/90 text-like-foreground px-6 py-3 rounded-full font-bold text-xl transform rotate-12">
              LIKE
            </div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: useTransform(x, [-100, -50], [1, 0]) }}
          >
            <div className="bg-dislike/90 text-dislike-foreground px-6 py-3 rounded-full font-bold text-xl transform -rotate-12">
              PASS
            </div>
          </motion.div>
        </div>

        {/* Profile Info Section */}
        <div className="h-1/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-foreground">
                {profile.name}, {profile.age}
              </h2>
            </div>
            
            <div className="flex items-center text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{profile.location}</span>
              <Briefcase className="w-4 h-4 ml-4 mr-1" />
              <span className="text-sm">{profile.profession}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-8">
            <Button
              variant="dislike"
              onClick={handlePass}
              className="shadow-lg"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button
              variant="like"
              onClick={handleLike}
              className="shadow-lg"
            >
              <Heart className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;