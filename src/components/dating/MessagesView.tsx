import React from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockMatches = [
  {
    id: '1',
    name: 'Sophie',
    avatar: '/src/assets/profile-1.jpg',
    lastMessage: 'Salut ! Comment ça va ?',
    timestamp: '14:30',
    unread: true
  },
  {
    id: '2',
    name: 'Alexandre',
    avatar: '/src/assets/profile-2.jpg',
    lastMessage: 'On se fait un café cette semaine ?',
    timestamp: 'Hier',
    unread: false
  }
];

interface MessagesViewProps {
  onStartChat: (matchId: string) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ onStartChat }) => {
  if (mockMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-gradient-message rounded-full w-20 h-20 flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-message-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Aucun match pour le moment</h3>
        <p className="text-muted-foreground mb-6">
          Commencez à swiper pour trouver des matches et entamer des conversations !
        </p>
        <Button variant="love" className="rounded-full">
          <Heart className="w-5 h-5 mr-2" />
          Découvrir des profils
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="p-6 border-b border-border/10">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          {mockMatches.length} conversation{mockMatches.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-y-auto flex-1">
        {mockMatches.map((match) => (
          <div
            key={match.id}
            onClick={() => onStartChat(match.id)}
            className="flex items-center p-4 border-b border-border/5 hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <div className="relative">
              <Avatar className="w-14 h-14">
                <AvatarImage src={match.avatar} alt={match.name} />
                <AvatarFallback>{match.name[0]}</AvatarFallback>
              </Avatar>
              {match.unread && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 ml-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-foreground">{match.name}</h3>
                <span className="text-sm text-muted-foreground">{match.timestamp}</span>
              </div>
              <p className={`text-sm mt-1 ${
                match.unread ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}>
                {match.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesView;