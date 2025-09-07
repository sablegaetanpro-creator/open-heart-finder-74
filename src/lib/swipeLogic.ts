import { supabase } from "@/integrations/supabase/client";

export interface SwipeResult {
  success: boolean;
  match: boolean;
  match_id?: number;
  message?: string;
}

export interface ProfileForSwipe {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  bio?: string;
  photos: string[];
  profile_photo_url: string;
  profession?: string;
  interests?: string[];
  height?: number;
  education?: string;
  exercise_frequency?: string;
  children?: string;
  animals?: string;
  smoker?: boolean;
  drinks?: string;
  superlike_from_user?: boolean; // Indique si cette personne nous a superliké
}

export interface LikeGivenProfile {
  swipe_id: string;
  swiper_id: string;
  swiped_id: string;
  created_at: string;
  profile_id: string;
  display_name: string;
  age: number;
  profile_photo_url: string;
  bio?: string;
  profession?: string;
  interests?: string[];
  height?: number;
  education?: string;
  exercise_frequency?: string;
  children?: string;
  animals?: string;
  smoker?: boolean;
  drinks?: string;
  photos: string[];
}

// Gérer un swipe (like, dislike, superlike)
export async function handleSwipe(
  swiperId: string, 
  swipedId: string, 
  liked: boolean, 
  superlike: boolean = false
): Promise<SwipeResult> {
  try {
    const { data, error } = await supabase.rpc('rpc_handle_swipe', {
      swiper: swiperId,
      swiped: swipedId,
      liked,
      superlike
    });

    if (error) {
      console.error('Swipe error:', error);
      return {
        success: false,
        match: false,
        message: "Impossible d'enregistrer le swipe"
      };
    }

    return {
      success: data.success,
      match: data.match,
      match_id: data.match_id,
      message: data.message
    };
  } catch (error) {
    console.error('Swipe exception:', error);
    return {
      success: false,
      match: false,
      message: "Impossible d'enregistrer le swipe"
    };
  }
}

// Récupérer les profils pour la découverte (avec priorité aux personnes qu'on a likées)
export async function getDiscoveryProfiles(userId: string, limit: number = 10): Promise<ProfileForSwipe[]> {
  try {
    // D'abord récupérer les profils qu'on a likés (pour augmenter les chances de match)
    const { data: likedProfiles, error: likedError } = await supabase
      .from('profiles')
      .select(`
        id, user_id, display_name, age, gender, bio, photos, profile_photo_url,
        profession, interests, height, education, exercise_frequency, 
        children, animals, smoker, drinks
      `)
      .in('user_id', 
        supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', userId)
          .eq('liked', true)
      )
      .neq('user_id', userId)
      .limit(Math.ceil(limit / 2));

    // Ensuite récupérer des nouveaux profils
    const { data: newProfiles, error: newError } = await supabase
      .from('profiles')
      .select(`
        id, user_id, display_name, age, gender, bio, photos, profile_photo_url,
        profession, interests, height, education, exercise_frequency, 
        children, animals, smoker, drinks
      `)
      .not('user_id', 'in', 
        supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', userId)
      )
      .neq('user_id', userId)
      .eq('is_profile_complete', true)
      .limit(Math.ceil(limit / 2));

    if (likedError && newError) {
      console.error('Discovery profiles error:', likedError, newError);
      return [];
    }

    // Combiner et mélanger les profils
    const allProfiles = [...(likedProfiles || []), ...(newProfiles || [])];
    
    // Vérifier les superlikes reçus pour chaque profil
    const profilesWithSuperlike = await Promise.all(
      allProfiles.map(async (profile) => {
        const { data: superlikeData } = await supabase
          .from('swipes')
          .select('superlike')
          .eq('swiper_id', profile.user_id)
          .eq('swiped_id', userId)
          .eq('superlike', true)
          .single();

        return {
          ...profile,
          superlike_from_user: !!superlikeData
        };
      })
    );

    return profilesWithSuperlike;
  } catch (error) {
    console.error('Get discovery profiles exception:', error);
    return [];
  }
}

// Récupérer les likes donnés
export async function getLikesGiven(userId: string): Promise<LikeGivenProfile[]> {
  try {
    const { data, error } = await supabase.rpc('get_given_likes_profiles', {
      target_user_id: userId
    });

    if (error) {
      console.error('Get likes given error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get likes given exception:', error);
    return [];
  }
}

// Supprimer un like donné (mettre liked = false)
export async function removeLike(swiperId: string, swipedId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from('swipes')
      .update({ liked: false, superlike: false })
      .eq('swiper_id', swiperId)
      .eq('swiped_id', swipedId);

    if (error) {
      console.error('Remove like error:', error);
      return {
        success: false,
        message: "Impossible de supprimer le like"
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Remove like exception:', error);
    return {
      success: false,
      message: "Erreur de connexion au serveur"
    };
  }
}

// Récupérer les likes reçus
export async function getLikesReceived(userId: string): Promise<ProfileForSwipe[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, user_id, display_name, age, gender, bio, photos, profile_photo_url,
        profession, interests, height, education, exercise_frequency, 
        children, animals, smoker, drinks
      `)
      .in('user_id', 
        supabase
          .from('swipes')
          .select('swiper_id')
          .eq('swiped_id', userId)
          .eq('liked', true)
      );

    if (error) {
      console.error('Get likes received error:', error);
      return [];
    }

    return data?.map(profile => ({
      ...profile,
      superlike_from_user: false
    })) || [];
  } catch (error) {
    console.error('Get likes received exception:', error);
    return [];
  }
}

// Récupérer les compteurs de likes
export async function getLikesCount(userId: string): Promise<{ given: number; received: number }> {
  try {
    const [givenResult, receivedResult] = await Promise.all([
      supabase.rpc('get_likes_given_count', { user_id: userId }),
      supabase.rpc('get_likes_received_count', { user_id: userId })
    ]);

    return {
      given: givenResult.data || 0,
      received: receivedResult.data || 0
    };
  } catch (error) {
    console.error('Get likes count exception:', error);
    return { given: 0, received: 0 };
  }
}