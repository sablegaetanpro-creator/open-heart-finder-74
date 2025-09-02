import React from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmojiButtonProps {
  onClick: () => void;
  isSending: boolean;
}

const EmojiButton: React.FC<EmojiButtonProps> = ({ onClick, isSending }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      disabled={isSending}
    >
      <Smile className="w-4 h-4" />
    </Button>
  );
};

export default EmojiButton;