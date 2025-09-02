import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface EmptyMatchesViewProps {
  onSwiping: () => void;
}

const EmptyMatchesView: React.FC<EmptyMatchesViewProps> = ({ onSwiping }) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun match pour le moment</h3>
        <p className="text-muted-foreground mb-4">
          Continuez à swiper pour trouver votre âme sœur !
        </p>
        <Button onClick={onSwiping}>
          Commencer à swiper
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyMatchesView;