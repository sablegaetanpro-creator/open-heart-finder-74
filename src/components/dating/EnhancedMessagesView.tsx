import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';
import MessagesView from './MessagesView';

interface EnhancedMessagesViewProps {
  onStartChat: (matchId: string) => void;
}

const EnhancedMessagesView: React.FC<EnhancedMessagesViewProps> = ({ onStartChat }) => {
  return <MessagesView onStartChat={onStartChat} />;
};

export default EnhancedMessagesView;