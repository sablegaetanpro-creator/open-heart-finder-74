-- Nettoyer et simplifier la base de données

-- Supprimer les tables inutiles et les vues
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS likes_revealed CASCADE;
DROP TABLE IF EXISTS profile_boosts CASCADE;
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS premium_features CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;

-- Supprimer les vues
DROP VIEW IF EXISTS compatible_profiles_view CASCADE;
DROP VIEW IF EXISTS matches_with_profiles CASCADE;
DROP VIEW IF EXISTS messages_with_sender CASCADE;
DROP VIEW IF EXISTS swipes_with_profiles CASCADE;
DROP VIEW IF EXISTS recent_user_activity CASCADE;
DROP VIEW IF EXISTS user_detailed_stats CASCADE;

-- Simplifier les policies RLS pour les messages
DROP POLICY IF EXISTS "Users can insert messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can view match messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "msg_insert_own" ON messages;
DROP POLICY IF EXISTS "msg_select_participants" ON messages;
DROP POLICY IF EXISTS "msg_update_participants" ON messages;

-- Recréer des policies simples pour les messages
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_select_own" ON messages
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Nettoyer les fonctions inutiles
DROP FUNCTION IF EXISTS cleanup_old_swipes() CASCADE;
DROP FUNCTION IF EXISTS remove_user_like(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_data() CASCADE;
DROP FUNCTION IF EXISTS get_database_stats() CASCADE;
DROP FUNCTION IF EXISTS perform_maintenance() CASCADE;
DROP FUNCTION IF EXISTS check_data_integrity() CASCADE;
DROP FUNCTION IF EXISTS get_compatible_profiles(uuid, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_match_status(uuid, uuid) CASCADE;

-- Garder seulement les fonctions essentielles
-- update_updated_at_column : pour les timestamps automatiques
-- create_match_if_mutual : pour créer les matches
-- can_view_profile : pour la sécurité des profils
-- create_user_profile : pour créer les profils utilisateur