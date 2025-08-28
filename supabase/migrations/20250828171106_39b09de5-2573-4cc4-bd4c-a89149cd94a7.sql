-- Fix security warnings first
-- 1. Fix function search path for existing functions
CREATE OR REPLACE FUNCTION public.can_view_profile(target_user_id UUID, viewer_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    viewer_profile profiles%ROWTYPE;
    target_profile profiles%ROWTYPE;
BEGIN
    -- Get viewer profile
    SELECT * INTO viewer_profile FROM profiles WHERE user_id = viewer_user_id;
    -- Get target profile 
    SELECT * INTO target_profile FROM profiles WHERE user_id = target_user_id;
    
    -- Allow viewing own profile
    IF target_user_id = viewer_user_id THEN
        RETURN true;
    END IF;
    
    -- Check if profiles exist
    IF viewer_profile.user_id IS NULL OR target_profile.user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Basic compatibility checks
    IF (viewer_profile.looking_for = 'hommes' AND target_profile.gender = 'homme') OR
       (viewer_profile.looking_for = 'femmes' AND target_profile.gender = 'femme') OR
       (viewer_profile.looking_for = 'tout' AND target_profile.gender IN ('homme', 'femme')) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;