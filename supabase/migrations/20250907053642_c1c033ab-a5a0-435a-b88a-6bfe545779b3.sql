-- Complete the migration with remaining parts
-- 1. Update profiles table structure
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Update display_name from first_name for existing records
UPDATE public.profiles SET display_name = first_name WHERE display_name IS NULL;

-- 2. Update swipes table structure (rename columns to match specs)
ALTER TABLE public.swipes 
  ADD COLUMN IF NOT EXISTS liked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS superlike BOOLEAN DEFAULT false;

-- Migrate existing data
UPDATE public.swipes SET liked = is_like WHERE liked IS NULL;
UPDATE public.swipes SET superlike = is_super_like WHERE superlike IS NULL;

-- Drop old columns (after data migration)
ALTER TABLE public.swipes 
  DROP COLUMN IF EXISTS is_like,
  DROP COLUMN IF EXISTS is_super_like;

-- Add unique constraint for swiper/swiped pairs
ALTER TABLE public.swipes 
  ADD CONSTRAINT unique_swipe_pair UNIQUE (swiper_id, swiped_id);

-- 3. Update messages table (already correct structure)
-- Add content_type if missing
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text';

-- 4. Create RPC function for handling swipes (with proper search_path)
CREATE OR REPLACE FUNCTION public.rpc_handle_swipe(
  swiper UUID,
  swiped UUID, 
  liked BOOLEAN,
  superlike BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_swipe_id UUID;
  reciprocal_exists BOOLEAN;
  match_id BIGINT;
  result JSON;
BEGIN
  -- Insert or update the swipe
  INSERT INTO public.swipes (swiper_id, swiped_id, liked, superlike)
  VALUES (swiper, swiped, liked, superlike)
  ON CONFLICT (swiper_id, swiped_id) 
  DO UPDATE SET 
    liked = EXCLUDED.liked,
    superlike = EXCLUDED.superlike,
    created_at = now()
  RETURNING id INTO existing_swipe_id;

  -- Initialize result
  result := json_build_object('success', true, 'match', false, 'match_id', null);

  -- Only check for match if this is a like
  IF liked = true THEN
    -- Check if there's a reciprocal like
    SELECT EXISTS(
      SELECT 1 FROM public.swipes 
      WHERE swiper_id = swiped 
        AND swiped_id = swiper 
        AND liked = true
    ) INTO reciprocal_exists;
    
    -- If reciprocal like exists, create match
    IF reciprocal_exists THEN
      INSERT INTO public.matches (user_a, user_b)
      VALUES (LEAST(swiper, swiped), GREATEST(swiper, swiped))
      ON CONFLICT (user_a, user_b) DO NOTHING
      RETURNING id INTO match_id;
      
      -- Update result with match info
      result := json_build_object(
        'success', true, 
        'match', true, 
        'match_id', match_id,
        'message', 'C''est un match !'
      );
    END IF;
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Impossible d''enregistrer le swipe'
    );
END;
$$;

-- 5. Create function to get likes given count (with proper search_path)
CREATE OR REPLACE FUNCTION public.get_likes_given_count(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::INTEGER
  FROM public.swipes 
  WHERE swiper_id = user_id AND liked = true;
$$;

-- 6. Create function to get likes received count (with proper search_path)
CREATE OR REPLACE FUNCTION public.get_likes_received_count(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::INTEGER
  FROM public.swipes 
  WHERE swiped_id = user_id AND liked = true;
$$;

-- 7. Create function to get matches with last message (with proper search_path)
CREATE OR REPLACE FUNCTION public.get_user_matches_with_messages(user_id UUID)
RETURNS TABLE(
  match_id BIGINT,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_photo TEXT,
  last_message_content TEXT,
  last_message_time TIMESTAMPTZ,
  has_messages BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    CASE 
      WHEN m.user_a = user_id THEN m.user_b
      ELSE m.user_a 
    END as other_user_id,
    p.display_name as other_user_name,
    p.profile_photo_url as other_user_photo,
    msg.content as last_message_content,
    msg.created_at as last_message_time,
    (msg.id IS NOT NULL) as has_messages
  FROM public.matches m
  JOIN public.profiles p ON (
    CASE 
      WHEN m.user_a = user_id THEN p.user_id = m.user_b
      ELSE p.user_id = m.user_a 
    END
  )
  LEFT JOIN LATERAL (
    SELECT content, created_at, id
    FROM public.messages 
    WHERE match_id = m.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) msg ON true
  WHERE m.user_a = user_id OR m.user_b = user_id
  ORDER BY COALESCE(msg.created_at, m.created_at) DESC;
END;
$$;

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_liked ON public.swipes(swiper_id) WHERE liked = true;
CREATE INDEX IF NOT EXISTS idx_swipes_swiped_liked ON public.swipes(swiped_id) WHERE liked = true;
CREATE INDEX IF NOT EXISTS idx_messages_match_created ON public.messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- 9. Recreate RLS policies for updated schema
-- Matches policies
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Messages policies  
CREATE POLICY "Users can read messages in their matches" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = messages.match_id 
      AND (user_a = auth.uid() OR user_b = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = messages.match_id 
      AND (user_a = auth.uid() OR user_b = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their matches" ON public.messages
  FOR UPDATE USING (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = messages.match_id 
      AND (user_a = auth.uid() OR user_b = auth.uid())
    )
  );

-- Swipes policies
CREATE POLICY "Users can create own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Users can view their own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

-- Storage policies for chat media
CREATE POLICY "Users can view chat media for their matches" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-media' AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE auth.uid() IN (user_a, user_b)
      AND (
        name LIKE CONCAT(user_a::text, '/%') OR 
        name LIKE CONCAT(user_b::text, '/%')
      )
    )
  );