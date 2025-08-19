-- CORRECTION SÉCURITAIRE CRITIQUE : Supprimer l'accès public aux profils
-- Cette politique permet actuellement à n'importe qui de voir tous les profils sans authentification

-- Supprimer la politique dangereuse qui permet l'accès public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Supprimer aussi la politique "Block anonymous access" qui est redondante
DROP POLICY IF EXISTS "Block anonymous access" ON public.profiles;

-- Les politiques existantes pour les utilisateurs authentifiés restent en place :
-- 1. "Users can view own profile" - pour voir son propre profil
-- 2. "Users can view compatible profiles only" - pour la découverte (avec logique de compatibilité)
-- 3. "Users can view matched profiles" - pour voir les profils des matches

-- Vérifier que RLS est bien activé (déjà fait, mais on s'assure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ajouter une politique explicite pour bloquer l'accès anonyme si besoin
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);