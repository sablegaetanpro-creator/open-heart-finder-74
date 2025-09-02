// src/services/messageService.ts

import { supabase } from './supabaseClient';

/**
 * Envoyer un message à un match
 */
export async function sendMessage(matchId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Pas connecté');

  const { error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: user.id,
      content: content
    });

  if (error) throw error;
}

/**
 * Récupérer les messages d'un match
 */
export async function getMessagesWithUser(matchId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}