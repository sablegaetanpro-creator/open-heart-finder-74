import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface SendMessageButtonProps {
  onClick: () => void;
  isSending: boolean;
}

const SendMessageButton: React.FC<SendMessageButtonProps> = ({
  onClick,
  isSending
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={!newMessage.trim() || isSending || isRecording}
      size="icon"
      className={cn(
        "bg-gradient-love hover:opacity-90 transition-all",
        isSending && "opacity-50"
      )}
      title="Envoyer le message"
    >
      {isSending ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SendMessageButton;