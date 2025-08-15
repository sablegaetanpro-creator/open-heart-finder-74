-- LoveConnect Dating App - Migrations de base de données
-- Exécutez ces commandes dans votre dashboard Supabase SQL Editor

-- =====================================================
-- 1. CRÉATION DES TABLES PRINCIPALES
-- =====================================================

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme', 'autre')),
  looking_for TEXT NOT NULL CHECK (looking_for IN ('homme', 'femme', 'les_deux')),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('amitie', 'relation_serieuse', 'relation_casuelle', 'mariage')),
  smoker BOOLEAN DEFAULT false,
  animals TEXT NOT NULL CHECK (animals IN ('aime_animaux', 'n_aime_pas_animaux', 'allergie_animaux')),
  children TEXT NOT NULL CHECK (children IN ('veut_enfants', 'ne_veut_pas_enfants', 'a_deja_enfants', 'pas_sur')),
  profile_photo_url TEXT DEFAULT '',
  bio TEXT,
  location TEXT,
  max_distance INTEGER DEFAULT 50,
  interests TEXT[] DEFAULT '{}',
  is_profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des swipes (likes/dislikes)
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL,
  is_super_like BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, swiped_id)
);

-- Table des matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. TABLES DE MONÉTISATION
-- =====================================================

-- Table des achats utilisateurs
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('premium', 'super_likes', 'boost', 'reveal_likes')),
  plan TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('card', 'paypal', 'mobile')),
  payment_provider_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des fonctionnalités premium actives
CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('premium', 'super_likes', 'boost')),
  quantity INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, feature_type)
);

-- Table des vues publicitaires
CREATE TABLE IF NOT EXISTS ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'interstitial', 'rewarded')),
  ad_unit_id TEXT,
  completed BOOLEAN DEFAULT false,
  reward_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. ACTIVATION DE LA SÉCURITÉ RLS
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. POLITIQUES RLS
-- =====================================================

-- Politiques pour profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour swipes
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own swipes" ON swipes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can insert matches" ON matches FOR INSERT WITH CHECK (true);

-- Politiques pour messages
CREATE POLICY "Users can view messages in their matches" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);
CREATE POLICY "Users can insert messages in their matches" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- Politiques pour user_purchases
CREATE POLICY "Users can view own purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert purchases" ON user_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update purchases" ON user_purchases FOR UPDATE USING (true);

-- Politiques pour premium_features
CREATE POLICY "Users can view own premium features" ON premium_features FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert premium features" ON premium_features FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update premium features" ON premium_features FOR UPDATE USING (true);

-- Politiques pour ad_views
CREATE POLICY "Users can view own ad views" ON ad_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert ad views" ON ad_views FOR INSERT WITH CHECK (true);

-- =====================================================
-- 5. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour créer un profil utilisateur
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  age INTEGER,
  gender TEXT,
  looking_for TEXT,
  relationship_type TEXT,
  smoker BOOLEAN,
  animals TEXT,
  children TEXT,
  profile_photo_url TEXT,
  max_distance INTEGER,
  is_profile_complete BOOLEAN
) RETURNS profiles AS $$
DECLARE
  new_profile profiles;
BEGIN
  INSERT INTO profiles (
    user_id, email, first_name, age, gender, looking_for, 
    relationship_type, smoker, animals, children, profile_photo_url, 
    max_distance, is_profile_complete
  ) VALUES (
    user_id, email, first_name, age, gender, looking_for,
    relationship_type, smoker, animals, children, profile_photo_url,
    max_distance, is_profile_complete
  ) RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un match automatiquement
CREATE OR REPLACE FUNCTION create_match_if_mutual_like(
  user1_id UUID,
  user2_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  mutual_like BOOLEAN;
BEGIN
  -- Vérifier si les deux utilisateurs se sont likés mutuellement
  SELECT EXISTS (
    SELECT 1 FROM swipes s1
    JOIN swipes s2 ON s1.user_id = s2.swiped_id AND s1.swiped_id = s2.user_id
    WHERE s1.user_id = user1_id AND s1.swiped_id = user2_id
    AND s1.is_like = true AND s2.is_like = true
  ) INTO mutual_like;
  
  -- Créer le match si c'est un like mutuel
  IF mutual_like THEN
    INSERT INTO matches (user1_id, user2_id)
    VALUES (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour updated_at sur user_purchases
CREATE TRIGGER update_user_purchases_updated_at
  BEFORE UPDATE ON user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour updated_at sur premium_features
CREATE TRIGGER update_premium_features_updated_at
  BEFORE UPDATE ON premium_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour créer un match automatiquement après un swipe
CREATE TRIGGER create_match_on_mutual_like
  AFTER INSERT ON swipes
  FOR EACH ROW
  WHEN (NEW.is_like = true)
  EXECUTE FUNCTION create_match_if_mutual_like(NEW.user_id, NEW.swiped_id);

-- =====================================================
-- 7. INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les profils
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles(looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- Index pour les swipes
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at);

-- Index pour les matches
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Index pour les achats
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(status);

-- Index pour les fonctionnalités premium
CREATE INDEX IF NOT EXISTS idx_premium_features_user_id ON premium_features(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_features_is_active ON premium_features(is_active);

-- Index pour les vues publicitaires
CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON ad_views(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_type ON ad_views(ad_type);

-- =====================================================
-- 8. STOCKAGE POUR LES MÉDIAS
-- =====================================================

-- Créer le bucket pour les médias de chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', true, 52428800, ARRAY['image/*', 'video/*', 'audio/*'])
ON CONFLICT (id) DO NOTHING;

-- Politiques pour le bucket chat-media
CREATE POLICY "Users can upload their own chat media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view chat media for their matches" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-media' 
  AND (
    auth.uid()::text = (storage.foldername(name))[2]
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.messages msg ON msg.match_id = m.id
      WHERE msg.media_url LIKE '%' || name || '%'
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can delete their own chat media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- =====================================================
-- 9. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques profils de test (à supprimer en production)
-- INSERT INTO profiles (user_id, email, first_name, age, gender, looking_for, relationship_type, smoker, animals, children, bio, interests) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'test1@example.com', 'Sophie', 25, 'femme', 'homme', 'relation_serieuse', false, 'aime_animaux', 'veut_enfants', 'J\'aime voyager et découvrir de nouvelles cultures', ARRAY['Voyages', 'Musique', 'Cuisine']),
-- ('00000000-0000-0000-0000-000000000002', 'test2@example.com', 'Thomas', 28, 'homme', 'femme', 'relation_serieuse', false, 'aime_animaux', 'ne_veut_pas_enfants', 'Passionné de sport et de nature', ARRAY['Sport', 'Nature', 'Photographie']);

-- =====================================================
-- 10. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que toutes les tables ont été créées
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'swipes', 'matches', 'messages', 'user_purchases', 'premium_features', 'ad_views')
ORDER BY tablename;

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
