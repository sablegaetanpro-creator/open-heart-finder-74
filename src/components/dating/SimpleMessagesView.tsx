import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getMatches, getMessages, sendMessage, markMessagesAsRead, subscribeToMessages, MatchWithMessages, Message } from '@/lib/messageLogic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';

export const SimpleMessagesView = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithMessages[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithMessages | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Charger les matches
  useEffect(() => {
    if (!user?.id) return;

    const loadMatches = async () => {
      setLoading(true);
      try {
        const matchesData = await getMatches(user.id);
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast.error('Erreur lors du chargement des matches');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [user?.id]);

  // Charger les messages d'une conversation
  useEffect(() => {
    if (!selectedMatch) return;

    const loadMessages = async () => {
      try {
        const messagesData = await getMessages(selectedMatch.match_id);
        setMessages(messagesData);
        
        // Marquer comme lu
        if (user?.id) {
          await markMessagesAsRead(selectedMatch.match_id, user.id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Erreur lors du chargement des messages');
      }
    };

    loadMessages();

    // S'abonner aux nouveaux messages
    const unsubscribe = subscribeToMessages(selectedMatch.match_id, (message) => {
      setMessages(prev => [...prev, message]);
    });

    return unsubscribe;
  }, [selectedMatch, user?.id]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || !user?.id || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(selectedMatch.match_id, user.id, newMessage.trim());
      
      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message!]);
        setNewMessage('');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement des conversations...</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas encore de matches. Continuez à découvrir de nouveaux profils !
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedMatch) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-row items-center space-y-0 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedMatch(null)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={selectedMatch.other_user_photo} />
            <AvatarFallback>
              {selectedMatch.other_user_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg">{selectedMatch.other_user_name}</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-2">Démarrez la conversation !</p>
                {selectedMatch.suggested_opening && (
                  <p className="text-sm italic">
                    Suggestion : "{selectedMatch.suggested_opening}"
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sending}
              />
              <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos conversations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {matches.map((match) => (
            <div
              key={match.match_id}
              className="flex items-center p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
              onClick={() => setSelectedMatch(match)}
            >
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={match.other_user_photo} />
                <AvatarFallback>
                  {match.other_user_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-medium">{match.other_user_name}</h4>
                {match.has_messages && match.last_message_content ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {match.last_message_content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nouveau match ! Dites bonjour 👋
                  </p>
                )}
              </div>
              
              {match.last_message_time && (
                <div className="text-xs text-muted-foreground">
                  {new Date(match.last_message_time).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};