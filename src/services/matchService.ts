// src/services/matchService.ts

import { supabase } from './supabaseClient';

/**
 * Récupère tous les matchs de l'utilisateur
 */
export async function getMatches() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Pas connecté');

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      user2_id,
      created_at,
      profiles!user2_id (username, avatar_url, age)
    `)
    .eq('user1_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}