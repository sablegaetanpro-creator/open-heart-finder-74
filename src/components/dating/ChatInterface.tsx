import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Send, 
  ArrowLeft, 
  Heart, 
  Phone, 
  Video, 
  MoreVertical,
  Camera,
  Mic,
  Smile,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  otherUser: {
    id: string;
    first_name: string;
    profile_photo_url: string;
    age: number;
  };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  open,
  onOpenChange,
  matchId,
  otherUser
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const isAssistant = matchId === 'admin-support';

  // Charger les messages
  useEffect(() => {
    if (!open || !matchId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        if (isAssistant) {
          // For assistant, initialize with welcome message
          setMessages([{
            id: 'welcome',
            match_id: matchId,
            sender_id: 'assistant',
            content: 'Bonjour ! Je suis l\'assistant HeartSync. Comment puis-je vous aider aujourd\'hui ?',
            is_read: true,
            created_at: new Date().toISOString()
          }]);
        } else {
          // Regular chat loading
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true });

          if (error) throw error;
          setMessages(data || []);

          // Marquer les messages comme lus
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('match_id', matchId)
            .neq('sender_id', user?.id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Only set up real-time for regular chats, not assistant
    if (!isAssistant) {
      const channel = supabase
        .channel(`messages:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${matchId}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
            
            // Marquer comme lu si ce n'est pas notre message
            if (newMessage.sender_id !== user?.id) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMessage.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, matchId, user?.id, isAssistant]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      if (isAssistant) {
        // Add user message to local state immediately
        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          match_id: matchId,
          sender_id: user.id,
          content: messageContent,
          is_read: true,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        // Call assistant API
        const response = await supabase.functions.invoke('assistant-chat', {
          body: { message: messageContent }
        });

        if (response.data?.reply) {
          // Add assistant response
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            match_id: matchId,
            sender_id: 'assistant',
            content: response.data.reply,
            is_read: true,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        // Regular chat message
        const { error } = await supabase
          .from('messages')
          .insert({
            match_id: matchId,
            sender_id: user.id,
            content: messageContent,
            is_read: false
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      // Restore message if it failed
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-0 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.profile_photo_url} />
              <AvatarFallback>{otherUser.first_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{otherUser.first_name}</h3>
              <p className="text-xs text-muted-foreground">En ligne</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Heart className="w-12 h-12 text-primary mb-2" />
              <p className="text-muted-foreground">
                C'est un match ! Commencez la conversation avec {otherUser.first_name}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showTime = index === 0 || 
                  new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 min

                return (
                  <div key={message.id} className="space-y-1">
                    {showTime && (
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background">
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="pr-10"
                disabled={sending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim() || sending}
              className="h-9 w-9 p-0 rounded-full"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInterface;