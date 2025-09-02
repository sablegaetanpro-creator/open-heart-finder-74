import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessagesContextType {
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

const MessagesContext = React.createContext<MessagesContextType | undefined>(undefined);

export const useMessagesContext = () => {
  const context = React.useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessagesContext must be used within a MessagesProvider');
  }
  return context;
};

export default MessagesContext;