import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { simpleDataManager } from '@/lib/simpleDataManager';
import EnhancedChatInterface from './EnhancedChatInterface';

interface SimplifiedMessagesViewProps {
  onStartChat: (matchId: string, otherUser?: any) => void;
}

const SimplifiedMessagesView: React.FC<SimplifiedMessagesViewProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const matchesData = await simpleDataManager.getUserMatches(user.id);
      
      // Process matches to get the other user's profile
      const processedMatches = matchesData.map((match: any) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const otherProfile = match.user1_id === user.id 
          ? match.profiles_matches_user2_id_fkey 
          : match.profiles_matches_user1_id_fkey;

        return {
          ...match,
          otherUserId,
          otherProfile,
          lastMessage: null // À implémenter si nécessaire
        };
      });

      setMatches(processedMatches);
    } catch (error) {
      console.error('Erreur chargement matches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchClick = (match: any) => {
    setSelectedMatch(match);
    onStartChat(match.id, match.otherProfile);
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
  };

  if (selectedMatch) {
    return (
      <EnhancedChatInterface
        matchId={selectedMatch.id}
        otherUser={selectedMatch.otherProfile}
        onBack={handleBackToMatches}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Messages
        </h1>
        <p className="text-muted-foreground">
          {matches.length} conversation{matches.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Heart className="w-16 h-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Aucune conversation</h3>
              <p className="text-muted-foreground">
                Commencez à liker des profils pour créer des matches !
              </p>
            </div>
          </div>
        ) : (
          matches.map((match) => (
            <Card 
              key={match.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleMatchClick(match)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={match.otherProfile?.profile_photo_url} 
                      alt={match.otherProfile?.first_name} 
                    />
                    <AvatarFallback>
                      {match.otherProfile?.first_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">
                        {match.otherProfile?.first_name}
                        {match.otherProfile?.age && `, ${match.otherProfile.age}`}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        Match
                      </Badge>
                    </div>
                    
                    {match.lastMessage ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {match.lastMessage}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Démarrez la conversation !
                      </p>
                    )}
                  </div>

                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SimplifiedMessagesView;