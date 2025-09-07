import { supabase } from "@/integrations/supabase/client";

export interface MatchWithMessages {
  match_id: number;
  other_user_id: string;
  other_user_name: string;
  other_user_photo: string;
  last_message_content?: string;
  last_message_time?: string;
  has_messages: boolean;
  suggested_opening?: string;
}

export interface Message {
  id: number;
  match_id: number;
  sender_id: string;
  content: string;
  content_type: 'text' | 'image' | 'audio' | 'video';
  is_read: boolean;
  created_at: string;
}

// Récupérer tous les matches avec métadonnées des messages
export async function getMatches(userId: string): Promise<MatchWithMessages[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_matches_with_messages', {
      user_id: userId
    });

    if (error) {
      console.error('Get matches error:', error);
      return [];
    }

    // Ajouter suggestion d'ouverture pour matches sans messages
    return (data || []).map((match: any) => ({
      match_id: match.match_id,
      other_user_id: match.other_user_id,
      other_user_name: match.other_user_name,
      other_user_photo: match.other_user_photo,
      last_message_content: match.last_message_content,
      last_message_time: match.last_message_time,
      has_messages: match.has_messages,
      suggested_opening: match.has_messages 
        ? undefined 
        : "Salut ! J'ai aimé ton profil, tu veux discuter ?"
    }));
  } catch (error) {
    console.error('Get matches exception:', error);
    return [];
  }
}

// Récupérer les messages d'une conversation
export async function getMessages(matchId: number): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId.toString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get messages error:', error);
      return [];
    }

    return (data || []).map(msg => ({
      ...msg,
      content_type: msg.media_type || 'text'
    })) as Message[];
  } catch (error) {
    console.error('Get messages exception:', error);
    return [];
  }
}

// Envoyer un message
export async function sendMessage(
  matchId: number,
  senderId: string,
  content: string,
  contentType: 'text' | 'image' | 'audio' | 'video' = 'text'
): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
        content_type: contentType,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: "Impossible d'envoyer le message"
      };
    }

    return {
      success: true,
      message: data
    };
  } catch (error) {
    console.error('Send message exception:', error);
    return {
      success: false,
      error: "Erreur de connexion au serveur"
    };
  }
}

// Marquer les messages comme lus
export async function markMessagesAsRead(matchId: number, userId: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark messages as read error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Mark messages as read exception:', error);
    return { success: false };
  }
}

// Écouter les nouveaux messages en temps réel
export function subscribeToMessages(
  matchId: number, 
  onMessage: (message: Message) => void
) {
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
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Écouter les matches en temps réel
export function subscribeToMatches(
  userId: string, 
  onNewMatch: (match: MatchWithMessages) => void
) {
  const channel = supabase
    .channel(`matches:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches'
      },
      async (payload) => {
        const newMatch = payload.new as any;
        
        // Vérifier si l'utilisateur fait partie de ce match
        if (newMatch.user_a === userId || newMatch.user_b === userId) {
          // Récupérer les détails du match
          const { data } = await supabase.rpc('get_user_matches_with_messages', {
            user_id: userId
          });
          
          const matchDetails = data?.find((m: any) => m.match_id === newMatch.id);
          if (matchDetails) {
            onNewMatch({
              ...matchDetails,
              suggested_opening: "Salut ! J'ai aimé ton profil, tu veux discuter ?"
            });
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Uploader un média (image, audio, vidéo)
export async function uploadChatMedia(
  file: File,
  matchId: number,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${matchId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: "Impossible d'uploader le fichier"
      };
    }

    // Récupérer l'URL publique
    const { data } = supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: data.publicUrl
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: "Erreur de connexion au serveur"
    };
  }
}