import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessagesListSectionProps {
  matches: any[];
  onMatchClick: (match: any) => void;
  loading: boolean;
}

const MessagesListSection: React.FC<MessagesListSectionProps> = ({ 
  matches, 
  onMatchClick,
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 pb-20">
      <div className="p-4 space-y-4">
        {/* Assistant Support */}
        <AssistantCard onClick={() => setShowAdminChat(true)} />

        {/* Matches List */}
        {matches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Vos matches</h2>
            {matches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onMatchClick={() => onMatchClick(match)} 
              />
            ))}
          </div>
        )}

        {matches.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun match pour le moment</h3>
              <p className="text-muted-foreground">
                Continuez à swiper pour trouver votre âme sœur !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessagesListSection;