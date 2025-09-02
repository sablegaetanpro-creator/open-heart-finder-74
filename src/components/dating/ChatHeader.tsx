import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    age: number;
  };
  onBack: () => void;
  onShowProfile?: () => void;
  onReport: () => void;
  onBlock: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  matchId,
  otherUser,
  onBack,
  onShowProfile,
  onReport,
  onBlock
}) => {
  // Assistant chat header
  if (matchId === 'admin-support') {
    return (
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Bot className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Assistant HeartSync</h3>
            <p className="text-xs text-muted-foreground">En ligne</p>
          </div>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    );
  }

  // Regular chat header
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex items-center space-x-3 cursor-pointer" onClick={onShowProfile}>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <img 
            src={otherUser.avatar} 
            alt={otherUser.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{otherUser.name}</h3>
          <p className="text-xs text-muted-foreground">{otherUser.age} ans</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Bot className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;