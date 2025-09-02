import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface AssistantSupportCardProps {
  onClick: () => void;
}

const AssistantSupportCard: React.FC<AssistantSupportCardProps> = ({ onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Assistant HeartSync</h3>
              <span className="text-xs text-muted-foreground">En ligne</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ? Je suis là pour vous assister
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssistantSupportCard;