import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import MatchProfileCard from './MatchProfileCard';
import AssistantCard from './AssistantCard';

interface MessagesListSectionProps {
  matches: any[];
  onMatchClick: (matchId: string) => void;
  setShowAdminChat: (show: boolean) => void;
}

const MessagesListSection: React.FC<MessagesListSectionProps> = ({
  matches,
  onMatchClick,
  setShowAdminChat
}) => {
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
              <MatchProfileCard
                key={match.id}
                match={match}
                onMatchClick={() => onMatchClick(match.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {matches.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun match pour le moment</h3>
              <p className="text-muted-foreground">
                Continuez à swiper pour trouver des personnes compatibles !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessagesListSection;