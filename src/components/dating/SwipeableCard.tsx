import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  X, 
  MapPin, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Dumbbell,
  Baby,
  PawPrint,
  Cigarette,
  Wine,
  Expand
} from 'lucide-react';
import PhotoGallery from './PhotoGallery';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  profile_photo_url: string;
  additional_photos?: string[];
  bio?: string;
  profession?: string;
  interests?: string[];
  height?: number;
  education?: string;
  exercise_frequency?: string;
  children?: string;
  animals?: string;
  smoker?: boolean;
  drinks?: string;
}

interface SwipeableCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
  style?: React.CSSProperties;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ profile, onSwipe, style }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);

  const allPhotos = profile.additional_photos 
    ? [profile.profile_photo_url, ...profile.additional_photos].filter(Boolean)
    : [profile.profile_photo_url];

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right', profile.user_id);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', profile.user_id);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < allPhotos.length - 1 ? prev + 1 : prev
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  const handleLike = () => onSwipe('right', profile.user_id);
  const handlePass = () => onSwipe('left', profile.user_id);

  const getChildrenIcon = (children: string) => {
    switch (children) {
      case 'veut_enfants':
      case 'a_enfants':
        return <Baby className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAnimalsIcon = (animals: string) => {
    switch (animals) {
      case 'aime_animaux':
      case 'a_animaux':
        return <PawPrint className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      <Card className="w-full h-full bg-card border-0 shadow-xl overflow-hidden">
        <div className="relative h-full flex flex-col">
          {/* Photo principale */}
          <div className="relative flex-1 min-h-0">
            <div className="relative">
              <img
                src={allPhotos[currentPhotoIndex]}
                alt={profile.first_name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowPhotoGallery(true)}
              />
              
              {/* Indicateur de zoom sur la photo */}
              <div className="absolute top-4 right-4 bg-black/30 rounded-full p-1">
                <Expand className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Navigation photos */}
            {allPhotos.length > 1 && (
              <>
                <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1">
                  {allPhotos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 mx-0.5 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {currentPhotoIndex > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 p-0"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}

                {currentPhotoIndex < allPhotos.length - 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 p-0"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Informations de base */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile.first_name}, {profile.age}
                  </h2>
                  {profile.profession && (
                    <div className="flex items-center text-white/90 mt-1">
                      <Briefcase className="w-4 h-4 mr-1" />
                      <span className="text-sm">{profile.profession}</span>
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? '▲' : '▼'}
                </Button>
              </div>
            </div>
          </div>

          {/* Détails étendus (scroll vertical) - Toujours visible */}
          <div className="bg-background p-4 overflow-y-auto flex-shrink-0" style={{ maxHeight: showDetails ? '300px' : '120px' }}>
              {/* Bio */}
              {profile.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">À propos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {profile.height && (
                  <div className="flex items-center text-sm">
                    <span className="text-muted-foreground">📏</span>
                    <span className="ml-2">{profile.height} cm</span>
                  </div>
                )}
                
                {profile.education && (
                  <div className="flex items-center text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2 truncate">{profile.education}</span>
                  </div>
                )}
                
                {profile.exercise_frequency && (
                  <div className="flex items-center text-sm">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2 truncate">{profile.exercise_frequency}</span>
                  </div>
                )}
                
                {profile.children && getChildrenIcon(profile.children) && (
                  <div className="flex items-center text-sm">
                    {getChildrenIcon(profile.children)}
                    <span className="ml-2 truncate">{profile.children}</span>
                  </div>
                )}
                
                {profile.animals && getAnimalsIcon(profile.animals) && (
                  <div className="flex items-center text-sm">
                    {getAnimalsIcon(profile.animals)}
                    <span className="ml-2 truncate">{profile.animals}</span>
                  </div>
                )}
                
                {profile.smoker && (
                  <div className="flex items-center text-sm">
                    <Cigarette className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2">Fumeur</span>
                  </div>
                )}
                
                {profile.drinks && (
                  <div className="flex items-center text-sm">
                    <Wine className="w-4 h-4 text-muted-foreground" />
                    <span className="ml-2 truncate">{profile.drinks}</span>
                  </div>
                )}
              </div>

              {/* Centres d'intérêt */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.slice(0, 6).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {profile.interests.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.interests.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Photos supplémentaires */}
              {allPhotos.length > 1 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {allPhotos.slice(1, 5).map((photo, index) => (
                     <img
                        key={index}
                        src={photo}
                        alt={`${profile.first_name} ${index + 2}`}
                        className="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setCurrentPhotoIndex(index + 1)}
                      />
                    ))}
                  </div>
                </div>
               )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center items-center space-x-6 p-4 bg-background">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 p-0 border-2 border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handlePass}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 p-0 border-2 border-love hover:bg-love hover:text-love-foreground"
              onClick={handleLike}
            >
              <Heart className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Galerie photo en plein écran */}
      <PhotoGallery
        photos={allPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        onIndexChange={setCurrentPhotoIndex}
        profileName={profile.first_name}
      />
    </motion.div>
  );
};

export default SwipeableCard;