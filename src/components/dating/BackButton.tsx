import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onBack}>
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
};

export default BackButton;