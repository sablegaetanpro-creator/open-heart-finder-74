import { supabase } from '@/integrations/supabase/client';
import { offlineDataManager } from '@/lib/offlineDataManager';
import { v4 as uuidv4 } from 'uuid';

// Créer un swipe (like/dislike) - version centralisée
export async function createSwipe(
  swipedUserId: string,
  isLike: boolean,
  isSuperLike: boolean = false
): Promise<{ swipeId: string; isMatch: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Utiliser offlineDataManager pour gérer la logique offline/online
  offlineDataManager.setCurrentUser(user.id);
  return offlineDataManager.createSwipe(swipedUserId, isLike, isSuperLike);
}

// Vérifier si un match existe déjà entre deux utilisateurs
export async function getMatchIfExists(userId1: string, userId2: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId1},user2_id.eq.${userId1}`)
    .or(`user1_id.eq.${userId2},user2_id.eq.${userId2}`)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Erreur lors de la vérification du match:', error);
    return null;
  }

  return data;
}