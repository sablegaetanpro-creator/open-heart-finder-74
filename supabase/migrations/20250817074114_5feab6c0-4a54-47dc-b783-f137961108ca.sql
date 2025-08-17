-- Nettoyer les tables inutiles une par une
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS likes_revealed CASCADE;
DROP TABLE IF EXISTS profile_boosts CASCADE;
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS premium_features CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;

-- Corriger les fonctions avec search_path
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION create_match_if_mutual() SET search_path = public;
ALTER FUNCTION can_view_profile(uuid, uuid) SET search_path = public;