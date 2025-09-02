import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ChatActionsProps {
  handleReport: () => void;
  handleBlock: () => void;
}

const ChatActions: React.FC<ChatActionsProps> = ({
  handleReport,
  handleBlock
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-accent">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 bg-background border shadow-lg">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-accent">
              Voir le profil
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm hover:bg-accent" 
              onClick={handleReport}
            >
              Signaler
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm text-destructive hover:bg-destructive/10" 
              onClick={handleBlock}
            >
              Bloquer
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatActions;