import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Paperclip, Image, Video, Mic, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useOffline } from '@/hooks/useOffline';
import { toast } from '@/hooks/use-toast';
import { offlineDataManager } from '@/lib/offlineDataManager';
import { LocalMessage, LocalMatch } from '@/lib/offlineDatabase';

interface OfflineChatInterfaceProps {
  matchId: string;
  partnerName: string;
  partnerPhoto: string;
  onBack?: () => void;
}

const OfflineChatInterface: React.FC<OfflineChatInterfaceProps> = ({
  matchId,
  partnerName,
  partnerPhoto,
  onBack
}) => {
  const { user } = useAuth();
  const { isOnline, isSyncing } = useOffline();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
    
    // Mark messages as read when entering chat
    if (user) {
      markMessagesAsRead();
    }
  }, [matchId, user]);

  const loadMessages = async () => {
    try {
      const chatMessages = await offlineDataManager.getMatchMessages(matchId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    
    try {
      // Find the partner's ID from the match
      const match = await offlineDataManager.getMatchById(matchId);
      if (!match) return;
      
      const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      await offlineDataManager.markMessagesAsRead(matchId, partnerId);
      
      // Reload messages to show updated read status
      loadMessages();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const messageId = await offlineDataManager.createMessage(
        matchId,
        messageContent,
        'text'
      );

      // Add message to local state immediately for responsive UI
      const newMsg: LocalMessage = {
        id: messageId,
        match_id: matchId,
        sender_id: user.id,
        content: messageContent,
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
        is_dirty: true
      };

      setMessages(prev => [...prev, newMsg]);

      if (!isOnline) {
        toast({
          title: "Message envoyé",
          description: "Sera synchronisé quand vous serez en ligne",
        });
      }

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
      // Restore the message in the input
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border/10">
        <div className="flex items-center space-x-3">
          <img
            src={partnerPhoto}
            alt={partnerName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-foreground">{partnerName}</h3>
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <Badge variant="outline" className="text-xs">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Hors ligne
                </Badge>
              )}
              {isSyncing && (
                <Badge variant="outline" className="text-xs">
                  Synchronisation...
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            Retour
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun message pour le moment. Envoyez le premier !
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {message.sender_id === user?.id && (
                      <div className="flex items-center space-x-1">
                        {message.is_dirty && !isOnline && (
                          <span className="text-xs opacity-70">📤</span>
                        )}
                        {message.is_read && (
                          <span className="text-xs opacity-70">✓✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Offline Notice */}
      {!isOnline && (
        <div className="mx-4 mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center text-xs text-yellow-800 dark:text-yellow-200">
            <WifiOff className="w-3 h-3 mr-2" />
            Les messages seront envoyés quand vous serez en ligne
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-background border-t border-border/10">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Image className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Tapez votre message..."
            className="flex-1"
            disabled={isSending}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfflineChatInterface;