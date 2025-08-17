-- Corriger la fonction create_user_profile
ALTER FUNCTION create_user_profile(uuid, text, text, integer, text, text, text, boolean, text, text, text, integer, boolean) SET search_path = public;

-- Nettoyer la fonction on_swipe_create_match qui n'est plus utilisée
DROP FUNCTION IF EXISTS on_swipe_create_match() CASCADE;