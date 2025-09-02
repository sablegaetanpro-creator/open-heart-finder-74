import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

interface ChatHeaderActionsProps {
  onProfileClick: () => void;
  onReport: () => void;
  onBlock: () => void;
}

const ChatHeaderActions: React.FC<ChatHeaderActionsProps> = ({
  onProfileClick,
  onReport,
  onBlock
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" className="hover:bg-accent">
        <MoreVertical className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default ChatHeaderActions;