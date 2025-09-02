import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface AssistantProfileHeaderProps {
  onBack: () => void;
}

const AssistantProfileHeader: React.FC<AssistantProfileHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <Bot className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Assistant HeartSync</h3>
        <p className="text-xs text-muted-foreground">En ligne</p>
      </div>
    </div>
  );
};

export default AssistantProfileHeader;