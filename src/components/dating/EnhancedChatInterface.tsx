import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Video, Mic, Smile, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Compression basique d'images côté client pour éviter les erreurs de taille
async function compressImage(file: File, maxDimension = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.onload = () => {
      const img = document.createElement('img');
      img.onerror = () => reject(new Error('Chargement de l\'image impossible'));
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Contexte canvas indisponible'));
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          blob => {
            if (!blob) return reject(new Error('Compression impossible'));
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_type?: 'image' | 'video' | 'audio';
  media_url?: string;
  is_read: boolean;
}

interface EnhancedChatInterfaceProps {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    age: number;
  };
  onBack: () => void;
  onShowProfile?: () => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  matchId,
  otherUser,
  onBack,
  onShowProfile
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadMessages();
    scrollToBottom();
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      // Conversation spéciale assistant: pas d'appel Supabase
      if (matchId === 'admin-support') {
        setMessages([{
          id: 'welcome',
          content: "Bonjour ! Je suis l'assistant. Pose-moi tes questions ici.",
          sender_id: 'assistant',
          created_at: new Date().toISOString(),
          is_read: true,
        } as Message]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'video' | 'audio' = 'text', mediaUrl?: string) => {
    if (!user || (!content.trim() && !mediaUrl)) return;

    setIsSending(true);
    try {
      // Mode assistant: pas d'écriture en base, on garde en local
      if (matchId === 'admin-support') {
        const localMessage: Message = {
          id: `temp-${Date.now()}`,
          content: content.trim() || (type === 'image' ? '📷 Photo' : type === 'video' ? '🎥 Vidéo' : type === 'audio' ? '🎵 Audio' : ''),
          sender_id: user.id,
          created_at: new Date().toISOString(),
          media_type: type === 'text' ? undefined : (type as 'image' | 'video' | 'audio'),
          media_url: mediaUrl,
          is_read: true,
        };
        setMessages(prev => [...prev, localMessage]);
        setNewMessage('');
        toast({
          title: 'Message envoyé',
          description: type === 'text' ? 'Votre message a été envoyé (assistant)' : 'Votre média a été envoyé (assistant)'
        });
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: content.trim() || (type === 'image' ? '📷 Photo' : type === 'video' ? '🎥 Vidéo' : type === 'audio' ? '🎵 Audio' : ''),
          media_type: type === 'text' ? null : (type as 'image' | 'video' | 'audio'),
          media_url: mediaUrl
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');
      
      toast({
        title: "Message envoyé",
        description: type === 'text' ? "Votre message a été envoyé" : "Votre média a été envoyé"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendText = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      // Compresser si l'image est volumineuse (> 6MB) pour rester sous les limites usuelles
      const shouldCompress = file.size > 6 * 1024 * 1024;
      const blobToUpload = shouldCompress ? await compressImage(file, 1920, 0.8) : file;
      const contentType = shouldCompress ? 'image/jpeg' : (file.type || 'image/jpeg');
      const safeName = shouldCompress
        ? `${matchId}/${user?.id}/${Date.now()}_${file.name}`.replace(/\.[^.]+$/, '.jpg')
        : `${matchId}/${user?.id}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(safeName, blobToUpload, { contentType });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(safeName);

      await sendMessage('', 'image', publicUrl);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer l'image${error?.message ? `: ${error.message}` : ''}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une vidéo valide",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit (aligné avec plan gratuit)
      toast({
        title: "Erreur",
        description: "La vidéo est trop volumineuse (max 50MB)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      const fileName = `${matchId}/${user?.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, { contentType: file.type || 'video/mp4' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      await sendMessage('', 'video', publicUrl);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la vidéo",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const fileName = `${matchId}/${user?.id}/${Date.now()}_audio.wav`;
        
        try {
          const { data, error } = await supabase.storage
            .from('chat-media')
            .upload(fileName, audioBlob, { contentType: 'audio/wav' });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('chat-media')
            .getPublicUrl(fileName);

          await sendMessage('', 'audio', publicUrl);
        } catch (error: any) {
          toast({
            title: "Erreur",
            description: "Impossible d'envoyer l'audio",
            variant: "destructive"
          });
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Enregistrement",
        description: "Enregistrement audio en cours..."
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReport = async () => {
    toast({ 
      title: 'Signalement envoyé', 
      description: "Merci, notre équipe va examiner cette situation." 
    });
  };

  const handleBlock = async () => {
    toast({ 
      title: 'Utilisateur bloqué', 
      description: "Vous ne verrez plus cette personne." 
    });
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === user?.id;
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex w-full mb-4",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
          isOwn 
            ? "bg-gradient-love text-white ml-12" 
            : "bg-muted text-foreground mr-12"
        )}>
          {message.media_type === 'image' && message.media_url && (
            <div className="mb-2">
              <img 
                src={message.media_url} 
                alt="Shared image" 
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
                onClick={() => window.open(message.media_url, '_blank')}
                loading="lazy"
              />
            </div>
          )}
          
          {message.media_type === 'video' && message.media_url && (
            <div className="mb-2">
              <video 
                src={message.media_url} 
                controls 
                className="max-w-full rounded-lg"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          
          {message.media_type === 'audio' && message.media_url && (
            <div className="mb-2">
              <audio 
                src={message.media_url} 
                controls 
                className="w-full"
              />
            </div>
          )}
          
          {message.content && (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
          
          <div className={cn(
            "text-xs mt-1 opacity-70",
            isOwn ? "text-right" : "text-left"
          )}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onShowProfile}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{otherUser.name}</h3>
              <p className="text-xs text-muted-foreground">{otherUser.age} ans</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 bg-background border shadow-lg">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm hover:bg-accent" onClick={onBack}>
                  Voir le profil
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm hover:bg-accent" onClick={handleReport}>
                  Signaler
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm text-destructive hover:bg-destructive/10" onClick={handleBlock}>
                  Bloquer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-card border-t border-border p-2 pb-2" style={{ paddingBottom: '8px' }}>
        <div className="flex items-end space-x-2">
          {/* Media buttons */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
            >
              <Image className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => videoInputRef.current?.click()}
              disabled={isSending}
            >
              <Video className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                isRecording && "text-red-500 bg-red-100"
              )}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isSending}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={isSending}
              className="border-0 bg-muted focus-visible:ring-1 focus-visible:ring-primary pr-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isSending}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendText}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="bg-gradient-love hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default EnhancedChatInterface;