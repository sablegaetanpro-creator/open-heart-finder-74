import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EnhancedChatInterfaceProps {
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

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  matchId,
  otherUser,
  onBack,
  onShowProfile
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-3">
          <img 
            src={otherUser.avatar} 
            alt={otherUser.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">{otherUser.name}</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Messages Area - Placeholder */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Interface de chat en développement...</p>
      </div>

      {/* Input Area - Placeholder */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Tapez votre message..."
            className="flex-1 p-2 border rounded-lg"
            disabled
          />
          <Button disabled>Envoyer</Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;