import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProfileData {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  gender: string;
  looking_for: string;
  profile_photo_url: string;
  additional_photos?: string[];
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
  is_profile_complete: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

class SimpleDataManager {
  // Likes Management - Base de données comme source unique de vérité
  async getUserLikes(userId: string): Promise<any[]> {
    console.log('📊 Récupération des likes donnés pour:', userId);
    
    try {
      const { data, error } = await supabase.rpc('get_given_likes_profiles', {
        target_user_id: userId
      });

      if (error) {
        console.error('❌ Erreur récupération likes:', error);
        throw error;
      }

      console.log('✅ Likes récupérés:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserLikes:', error);
      return [];
    }
  }

  async removeLike(swiperId: string, swipedId: string): Promise<void> {
    console.log('🗑️ Suppression like:', { swiperId, swipedId });
    
    try {
      // Changement de true à false au lieu de suppression
      const { error } = await supabase
        .from('swipes')
        .update({ is_like: false })
        .eq('swiper_id', swiperId)
        .eq('swiped_id', swipedId);

      if (error) {
        console.error('❌ Erreur suppression like:', error);
        throw error;
      }

      console.log('✅ Like supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur removeLike:', error);
      throw error;
    }
  }

  // Discovery Management - Priorise les profils précédemment likés
  async getDiscoveryProfiles(userId: string, excludeIds: string[] = [], limit: number = 50): Promise<ProfileData[]> {
    console.log('🔍 Chargement profils découverte pour:', userId);
    
    try {
      // Récupérer le profil utilisateur pour les filtres
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!userProfile) {
        console.error('❌ Profil utilisateur non trouvé');
        return [];
      }

      // Récupérer les profils selon les filtres
      // On inclut les profils avec is_like = false (anciens likes supprimés)
      let query = supabase
        .from('profiles')
        .select(`
          *,
          swipes!left(is_like, created_at)
        `)
        .eq('is_profile_complete', true)
        .neq('user_id', userId);

      // Exclure les profils déjà vus
      if (excludeIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeIds.map(id => `"${id}"`).join(',')})`);
      }

      // Filtres de compatibilité basiques
      if (userProfile.looking_for && userProfile.looking_for !== 'les_deux') {
        query = query.eq('gender', userProfile.looking_for);
      }

      const { data, error } = await query.limit(limit * 2); // Plus large pour le tri

      if (error) {
        console.error('❌ Erreur chargement profils:', error);
        throw error;
      }

      if (!data) return [];

      // Séparer et prioriser les profils précédemment likés
      const previouslyLiked: ProfileData[] = [];
      const newProfiles: ProfileData[] = [];

      data.forEach((profile: any) => {
        // Vérifier si l'utilisateur a déjà liké ce profil (même si supprimé)
        const userSwipe = profile.swipes?.find((swipe: any) => 
          swipe.is_like === false // Anciens likes supprimés
        );

        const cleanProfile: ProfileData = {
          id: profile.id,
          user_id: profile.user_id,
          first_name: profile.first_name,
          age: profile.age,
          gender: profile.gender,
          looking_for: profile.looking_for,
          profile_photo_url: profile.profile_photo_url,
          additional_photos: profile.additional_photos,
          bio: profile.bio,
          profession: profile.profession,
          interests: profile.interests,
          height: profile.height,
          education: profile.education,
          exercise_frequency: profile.exercise_frequency,
          children: profile.children,
          animals: profile.animals,
          smoker: profile.smoker,
          drinks: profile.drinks,
          is_profile_complete: profile.is_profile_complete,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };

        if (userSwipe) {
          previouslyLiked.push(cleanProfile);
        } else {
          newProfiles.push(cleanProfile);
        }
      });

      // Combiner: anciens likes d'abord, puis nouveaux profils
      const finalProfiles = [...previouslyLiked, ...newProfiles].slice(0, limit);
      
      console.log('✅ Profils chargés:', {
        total: finalProfiles.length,
        previouslyLiked: previouslyLiked.length,
        newProfiles: newProfiles.length
      });

      return finalProfiles;

    } catch (error) {
      console.error('❌ Erreur getDiscoveryProfiles:', error);
      return [];
    }
  }

  // Swipe Management
  async createSwipe(swiperId: string, swipedId: string, isLike: boolean): Promise<boolean> {
    console.log('💝 Création swipe:', { swiperId, swipedId, isLike });
    
    try {
      const { data, error } = await supabase
        .from('swipes')
        .upsert({
          swiper_id: swiperId,
          swiped_id: swipedId,
          is_like: isLike,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('❌ Erreur création swipe:', error);
        throw error;
      }

      // Vérifier si c'est un match
      if (isLike) {
        const isMatch = await this.checkForMatch(swiperId, swipedId);
        if (isMatch) {
          toast({
            title: "🎉 C'est un match !",
            description: "Vous vous êtes aimés mutuellement !",
          });
        }
        return isMatch;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur createSwipe:', error);
      throw error;
    }
  }

  private async checkForMatch(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      // Vérifier si l'autre utilisateur a aussi liké
      const { data: reciprocalSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', user2Id)
        .eq('swiped_id', user1Id)
        .eq('is_like', true)
        .single();

      if (reciprocalSwipe) {
        // Créer le match
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: user1Id < user2Id ? user1Id : user2Id,
            user2_id: user1Id < user2Id ? user2Id : user1Id,
            created_at: new Date().toISOString()
          });

        if (matchError) {
          console.error('❌ Erreur création match:', matchError);
          return false;
        }

        console.log('🎉 Match créé avec succès !');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur vérification match:', error);
      return false;
    }
  }

  // Matches Management
  async getUserMatches(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_id_fkey(*),
          profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération matches:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserMatches:', error);
      return [];
    }
  }

  // Profile Management
  async getProfileByUserId(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération profil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur getProfileByUserId:', error);
      return null;
    }
  }

  // Messages Management
  async getMatchMessages(matchId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur récupération messages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erreur getMatchMessages:', error);
      return [];
    }
  }

  async createMessage(matchId: string, senderId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erreur création message:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Erreur createMessage:', error);
      throw error;
    }
  }
}

export const simpleDataManager = new SimpleDataManager();