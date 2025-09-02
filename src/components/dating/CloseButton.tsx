import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
    >
      <X className="w-5 h-5" />
    </Button>
  );
};

export default CloseButton;