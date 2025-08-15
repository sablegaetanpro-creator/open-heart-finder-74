import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, Briefcase, ChevronLeft, ChevronRight, Users, Baby, Cigarette, PawPrint } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types/database';

interface EnhancedSwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
  style?: React.CSSProperties;
}

const relationshipLabels = {
  'amitie': 'Amitié',
  'plan_un_soir': 'Plan d\'un soir',
  'couple_court_terme': 'Court terme',
  'couple_long_terme': 'Long terme'
};

const animalLabels = {
  'aime_animaux': '🐕 Aime les animaux',
  'veut_animaux': '🐱 Veut des animaux',
  'ne_veut_pas_animaux': '🚫 Pas d\'animaux'
};

const childrenLabels = {
  'a_enfants': '👶 A des enfants',
  'veut_enfants': '🍼 Veut des enfants',
  'ne_veut_pas_enfants': '🚫 Pas d\'enfants'
};

const EnhancedSwipeCard: React.FC<EnhancedSwipeCardProps> = ({ profile, onSwipe, style }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const photos = [profile.profile_photo_url, ...(profile.additional_photos || [])];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onSwipe('right', profile.id);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', profile.id);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <motion.div
      style={{ ...style, x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="h-full overflow-hidden shadow-card">
        {/* Photo Section */}
        <div className="relative h-3/5 overflow-hidden">
          <img
            src={photos[currentPhotoIndex]}
            alt={`${profile.first_name}`}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Photo Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <h2 className="text-2xl font-bold">{profile.first_name}, {profile.age}</h2>
            {profile.height && profile.weight && (
              <p className="text-sm opacity-90">{profile.height}cm • {profile.weight}kg</p>
            )}
          </div>

          {/* Verification Badge */}
          {profile.is_verified && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-500 text-white">
                ✓ Vérifié
              </Badge>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="h-2/5 p-4 space-y-3 overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {relationshipLabels[profile.relationship_type]}
            </Badge>
            
            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span>{childrenLabels[profile.children]}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <PawPrint className="w-3 h-3 text-muted-foreground" />
              <span>{animalLabels[profile.animals]}</span>
            </div>
            
            {profile.smoker && (
              <div className="flex items-center space-x-1">
                <Cigarette className="w-3 h-3 text-muted-foreground" />
                <span>Fumeur</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {(profile.religion || profile.politics) && (
            <div className="pt-2 border-t border-border/50 space-y-1 text-xs">
              {profile.religion && (
                <p><span className="font-medium">Religion:</span> {profile.religion}</p>
              )}
              {profile.politics && (
                <p><span className="font-medium">Politique:</span> {profile.politics}</p>
              )}
            </div>
          )}
        </div>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
        >
          <div className="absolute inset-0 bg-like/20 flex items-center justify-center">
            <div className="bg-like text-like-foreground px-4 py-2 rounded-full font-bold text-lg rotate-12">
              <Heart className="w-6 h-6 inline mr-2" />
              LIKE
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
        >
          <div className="absolute inset-0 bg-dislike/20 flex items-center justify-center">
            <div className="bg-dislike text-dislike-foreground px-4 py-2 rounded-full font-bold text-lg -rotate-12">
              <X className="w-6 h-6 inline mr-2" />
              PASS
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default EnhancedSwipeCard;