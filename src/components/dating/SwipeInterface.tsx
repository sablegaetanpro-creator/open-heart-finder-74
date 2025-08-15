import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import { toast } from '@/hooks/use-toast';

// Mock data for profiles
const mockProfiles = [
  {
    id: '1',
    name: 'Sophie',
    age: 26,
    photos: ['/src/assets/profile-1.jpg'],
    location: 'Paris, 5 km',
    profession: 'Designer graphique',
    interests: ['Voyage', 'Photographie', 'Yoga'],
    bio: 'Passionnée de design et d\'aventures. Toujours prête pour de nouveaux défis !'
  },
  {
    id: '2',
    name: 'Alexandre',
    age: 29,
    photos: ['/src/assets/profile-2.jpg'],
    location: 'Lyon, 12 km',
    profession: 'Développeur',
    interests: ['Tech', 'Escalade', 'Cuisine'],
    bio: 'Développeur le jour, chef cuisinier le soir. Amateur de bons vins et de conversations profondes.'
  },
  {
    id: '3',
    name: 'Camille',
    age: 24,
    photos: ['/src/assets/profile-3.jpg'],
    location: 'Bordeaux, 8 km',
    profession: 'Journaliste',
    interests: ['Écriture', 'Cinéma', 'Randonnée'],
    bio: 'Journaliste curieuse du monde. Toujours en quête d\'histoires authentiques à raconter.'
  }
];

const SwipeInterface: React.FC = () => {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right', profileId: string) => {
    const swipedProfile = profiles.find(p => p.id === profileId);
    
    if (direction === 'right' && swipedProfile) {
      // Simulate match (30% chance for demo)
      const isMatch = Math.random() > 0.7;
      
      if (isMatch) {
        toast({
          title: "🎉 C'est un match !",
          description: `Vous et ${swipedProfile.name} vous êtes plu mutuellement !`,
          duration: 4000,
        });
      } else {
        toast({
          title: "👍 Like envoyé",
          description: `${swipedProfile.name} sera notifiée de votre intérêt !`,
          duration: 2000,
        });
      }
    }

    // Remove the swiped profile and move to next
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    
    // If no more profiles, show end message
    if (profiles.length <= 1) {
      toast({
        title: "Plus de profils !",
        description: "Revenez plus tard pour découvrir de nouveaux profils.",
        duration: 3000,
      });
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">💕</div>
        <h3 className="text-xl font-semibold mb-2">Plus de profils pour le moment</h3>
        <p className="text-muted-foreground">
          Revenez plus tard pour découvrir de nouvelles personnes !
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full max-w-sm mx-auto">
      <AnimatePresence>
        {profiles.map((profile, index) => (
          <SwipeCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe}
            style={{
              zIndex: profiles.length - index,
              transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SwipeInterface;