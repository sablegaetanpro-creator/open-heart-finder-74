-- Fonction pour récupérer les profils des likes donnés (bypass RLS restrictions)
CREATE OR REPLACE FUNCTION public.get_given_likes_profiles(target_user_id uuid)
RETURNS TABLE (
  swipe_id uuid,
  swiper_id uuid,
  swiped_id uuid,
  created_at timestamp with time zone,
  profile_id uuid,
  first_name text,
  age integer,
  profile_photo_url text,
  bio text,
  profession text,
  interests text[],
  height integer,
  education text,
  exercise_frequency text,
  children text,
  animals text,
  smoker boolean,
  drinks text,
  additional_photos text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as swipe_id,
    s.swiper_id,
    s.swiped_id,
    s.created_at,
    p.id as profile_id,
    p.first_name,
    p.age,
    p.profile_photo_url,
    p.bio,
    p.profession,
    p.interests,
    p.height,
    p.education,
    p.exercise_frequency,
    p.children,
    p.animals,
    p.smoker,
    p.drinks,
    p.additional_photos
  FROM swipes s
  JOIN profiles p ON p.user_id = s.swiped_id
  WHERE s.swiper_id = target_user_id 
    AND s.is_like = true
  ORDER BY s.created_at DESC;
END;
$$;