import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Image, Video, Mic, Smile, MoreVertical, ArrowLeft, X, Play, Pause, FileImage, FileVideo, Clock } from 'lucide-react';
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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [previewMedia, setPreviewMedia] = useState<{type: 'image' | 'video', url: string, file: File} | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    loadMessages();
    scrollToBottom();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Real-time message received:', payload);
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id,
            created_at: payload.new.created_at,
            media_type: payload.new.media_type || undefined,
            media_url: payload.new.media_url || undefined,
            is_read: payload.new.is_read || false
          };
          
          // Only add if it's not from current user (avoid duplicates)
          if (payload.new.sender_id !== user?.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timer pour l'enregistrement audio
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

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
      setMessages((data as Message[]) || []);
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

      setMessages(prev => [...prev, data as Message]);
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

    // Créer prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setPreviewMedia({ type: 'image', url: previewUrl, file });
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

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "La vidéo est trop volumineuse (max 50MB)",
        variant: "destructive"
      });
      return;
    }

    // Créer prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setPreviewMedia({ type: 'video', url: previewUrl, file });
  };

  const confirmMediaUpload = async () => {
    if (!previewMedia || !user) return;

    try {
      setIsSending(true);
      setUploadProgress(0);

      let blobToUpload: Blob | File = previewMedia.file;
      let contentType = previewMedia.file.type;
      let fileName = `${matchId}/${user.id}/${Date.now()}_${previewMedia.file.name}`;

      // Compression pour les images volumineuses
      if (previewMedia.type === 'image' && previewMedia.file.size > 6 * 1024 * 1024) {
        setUploadProgress(25);
        blobToUpload = await compressImage(previewMedia.file, 1920, 0.8);
        contentType = 'image/jpeg';
        fileName = fileName.replace(/\.[^.]+$/, '.jpg');
      }

      setUploadProgress(50);

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(fileName, blobToUpload, { contentType });

      if (error) throw error;

      setUploadProgress(75);

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      await sendMessage('', previewMedia.type, publicUrl);
      
      // Nettoyage
      URL.revokeObjectURL(previewMedia.url);
      setPreviewMedia(null);
      setUploadProgress(0);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer le ${previewMedia.type === 'image' ? 'image' : 'vidéo'}${error?.message ? `: ${error.message}` : ''}`,
        variant: "destructive"
      });
      setUploadProgress(0);
    } finally {
      setIsSending(false);
    }
  };

  const cancelMediaUpload = () => {
    if (previewMedia) {
      URL.revokeObjectURL(previewMedia.url);
      setPreviewMedia(null);
    }
    setUploadProgress(0);
  };

  // Drag & Drop functionality
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewMedia({ type: 'image', url: previewUrl, file });
    } else if (file.type.startsWith('video/')) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "La vidéo est trop volumineuse (max 50MB)",
          variant: "destructive"
        });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPreviewMedia({ type: 'video', url: previewUrl, file });
    } else {
      toast({
        title: "Format non supporté",
        description: "Seules les images et vidéos sont acceptées",
        variant: "destructive"
      });
    }
  }, []);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        title: "Enregistrement audio",
        description: "Maintenez appuyé pour enregistrer"
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
    <div 
      className="flex flex-col h-full bg-background"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Prévisualisation</h3>
              <Button variant="ghost" size="icon" onClick={cancelMediaUpload}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              {previewMedia.type === 'image' ? (
                <img 
                  src={previewMedia.url} 
                  alt="Prévisualisation" 
                  className="w-full h-auto max-h-64 object-contain rounded-lg"
                />
              ) : (
                <video 
                  src={previewMedia.url} 
                  controls 
                  className="w-full h-auto max-h-64 rounded-lg"
                />
              )}
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Envoi en cours... {uploadProgress}%</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Button variant="outline" onClick={cancelMediaUpload} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={confirmMediaUpload} 
                disabled={isSending}
                className="flex-1 bg-gradient-love hover:opacity-90"
              >
                {isSending ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
        {/* Recording indicator */}
        {isRecording && (
          <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Enregistrement...</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-mono text-red-700 dark:text-red-300">
                {formatRecordingTime(recordingDuration)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          {/* Media buttons */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isRecording}
              title="Envoyer une image"
            >
              <Image className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => videoInputRef.current?.click()}
              disabled={isSending || isRecording}
              title="Envoyer une vidéo"
            >
              <Video className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-accent",
                isRecording && "text-red-500 bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              )}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isSending}
              title="Maintenir pour enregistrer un audio"
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
            disabled={!newMessage.trim() || isSending || isRecording}
            size="icon"
            className={cn(
              "bg-gradient-love hover:opacity-90 transition-all",
              isSending && "opacity-50"
            )}
            title="Envoyer le message"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Zone de drop pour les fichiers */}
        {dragCounterRef.current > 0 && (
          <div className="absolute inset-4 border-2 border-dashed border-primary rounded-lg bg-primary/5 flex items-center justify-center z-10">
            <div className="text-center">
              <FileImage className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Relâchez pour envoyer</p>
              <p className="text-xs text-muted-foreground">Images et vidéos acceptées</p>
            </div>
          </div>
        )}

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