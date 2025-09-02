import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface SendMessageFormProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  isSending: boolean;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({
  newMessage,
  setNewMessage,
  isSending,
  onSend,
  onKeyPress
}) => {
  return (
    <div className="flex items-center space-x-2 p-3 bg-card border-t border-border">
      <div className="flex-1 relative">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Tapez votre message..."
          disabled={isSending}
          className="w-full px-4 py-2 bg-muted rounded-full border-0 focus:ring-2 focus:ring-primary outline-none"
        />
      </div>
      <Button
        onClick={onSend}
        disabled={!newMessage.trim() || isSending}
        size="icon"
        className="bg-gradient-love hover:opacity-90 transition-all"
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart className="w-4 h-4 text-white fill-current" />
        )}
      </Button>
    </div>
  );
};

export default SendMessageForm;