import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleKeyPress,
  isSending
}) => {
  return (
    <div className="flex-1 relative">
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Tapez votre message..."
        disabled={isSending}
        className="border-0 bg-muted focus-visible:ring-1 focus-visible:ring-primary pr-12"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        disabled={isSending}
      >
        <Smile className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default MessageInput;