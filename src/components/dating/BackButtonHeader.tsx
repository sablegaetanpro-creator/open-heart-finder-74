import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonHeaderProps {
  onBack: () => void;
}

const BackButtonHeader: React.FC<BackButtonHeaderProps> = ({ onBack }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onBack}>
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
};

export default BackButtonHeader;