import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ChatInterfaceProps {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    age: number;
  };
  onBack: () => void;
  onShowProfile?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  matchId,
  otherUser,
  onBack,
  onShowProfile
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex" style={{ height: '100dvh' }}>
      <EnhancedChatInterface
        matchId={matchId}
        otherUser={otherUser}
        onBack={onBack}
        onShowProfile={onShowProfile}
      />
    </div>
  );
};

export default ChatInterface;