import { supabase } from "@/integrations/supabase/client";

export interface SignUpStep1Data {
  email: string;
  password: string;
  display_name: string;
}

export interface SignUpStep2Data {
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  looking_for: 'homme' | 'femme' | 'les_deux';
  relationship_type: 'amitie' | 'relation_serieuse' | 'relation_casuelle' | 'mariage';
  bio?: string;
  photos?: string[];
  smoker: boolean;
  animals: string;
  children: string;
  max_distance: number;
}

export interface AuthError {
  success: false;
  message: string;
}

export interface AuthSuccess {
  success: true;
  user: any;
  profile?: any;
}

// Étape 1 : Validation et création utilisateur Supabase Auth
export async function signUpStep1(data: SignUpStep1Data): Promise<AuthSuccess | AuthError> {
  // Validation des champs obligatoires
  if (!data.email || !data.password || !data.display_name) {
    return {
      success: false,
      message: "Tous les champs de la première étape doivent être remplis"
    };
  }

  // Validation format email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      message: "Format d'email invalide"
    };
  }

  // Validation mot de passe
  if (data.password.length < 6) {
    return {
      success: false,
      message: "Mot de passe trop court (minimum 6 caractères)"
    };
  }

  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          display_name: data.display_name
        }
      }
    });

    if (error) {
      // Gestion des erreurs spécifiques
      if (error.message.includes('already registered')) {
        return {
          success: false,
          message: "Email déjà utilisé"
        };
      }
      return {
        success: false,
        message: error.message || "Erreur lors de l'inscription"
      };
    }

    return {
      success: true,
      user: authData.user
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur"
    };
  }
}

// Étape 2 : Complétion du profil
export async function completeSignUpStep2(userId: string, data: SignUpStep2Data): Promise<AuthSuccess | AuthError> {
  // Validation âge
  if (data.age < 18) {
    return {
      success: false,
      message: "Vous devez avoir au moins 18 ans"
    };
  }

  try {
    // Récupérer l'utilisateur actuel pour l'email
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return {
        success: false,
        message: "Utilisateur non authentifié"
      };
    }

    // Créer le profil complet avec first_name au lieu de display_name
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: user.email!,
        first_name: user.user_metadata?.display_name || '',
        age: data.age,
        gender: data.gender,
        looking_for: data.looking_for,
        relationship_type: data.relationship_type,
        bio: data.bio,
        additional_photos: data.photos || [],
        smoker: data.smoker,
        animals: data.animals,
        children: data.children,
        max_distance: data.max_distance,
        profile_photo_url: data.photos?.[0] || '',
        is_profile_complete: true
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: "Erreur lors de la création du profil"
      };
    }

    return {
      success: true,
      user,
      profile
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur"
    };
  }
}

// Connexion
export async function signIn(email: string, password: string): Promise<AuthSuccess | AuthError> {
  if (!email || !password) {
    return {
      success: false,
      message: "Email et mot de passe requis"
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        message: "Adresse mail ou mot de passe invalide"
      };
    }

    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    return {
      success: true,
      user: data.user,
      profile
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur"
    };
  }
}

// Déconnexion
export async function signOut(): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return {
        success: false,
        message: "Erreur lors de la déconnexion"
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur"
    };
  }
}