import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessagesHeaderProps {
  onRevealLikes: () => void;
  hiddenLikesCount: number;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({ onRevealLikes, hiddenLikesCount }) => {
  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-center flex-1">Messages</h1>
        {hiddenLikesCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onRevealLikes}
            className="absolute right-4 top-4"
          >
            <Eye className="w-4 h-4 mr-1" />
            {hiddenLikesCount}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessagesHeader;