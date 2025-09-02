import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ChatHeaderContentProps {
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

const ChatHeaderContent: React.FC<ChatHeaderContentProps> = ({
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 bg-background border shadow-lg">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-accent" onClick={onShowProfile}>
                Voir le profil
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-accent" onClick={onReport}>
                Signaler
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm text-destructive hover:bg-destructive/10" onClick={onBlock}>
                Bloquer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ChatHeaderContent;