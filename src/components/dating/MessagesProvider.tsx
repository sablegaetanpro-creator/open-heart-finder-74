import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessagesProviderProps {
  children: React.ReactNode;
  user: any;
  loading: boolean;
  matches: any[];
  receivedLikes: any[];
  givenLikes: any[];
  hasRevealedLikes: boolean;
  setMatches: (matches: any[]) => void;
  setReceivedLikes: (likes: any[]) => void;
  setGivenLikes: (likes: any[]) => void;
  setHasRevealedLikes: (hasRevealed: boolean) => void;
}

const MessagesProvider: React.FC<MessagesProviderProps> = ({
  children,
  user,
  loading,
  matches,
  receivedLikes,
  givenLikes,
  hasRevealedLikes,
  setMatches,
  setReceivedLikes,
  setGivenLikes,
  setHasRevealedLikes
}) => {
  // Contexte pour partager les données de messagerie
  return (
    <MessagesContext.Provider value={{
      user,
      loading,
      matches,
      receivedLikes,
      givenLikes,
      hasRevealedLikes,
      setMatches,
      setReceivedLikes,
      setGivenLikes,
      setHasRevealedLikes
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesProvider;