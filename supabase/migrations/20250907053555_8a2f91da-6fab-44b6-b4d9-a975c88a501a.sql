-- Drop all dependent policies first
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view matched profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view chat media for their matches" ON storage.objects;
DROP POLICY IF EXISTS "matches_select_participant" ON public.matches;
DROP POLICY IF EXISTS "matches_insert_participant" ON public.matches;
DROP POLICY IF EXISTS "matches_update_participant" ON public.matches;
DROP POLICY IF EXISTS "messages_basic_update" ON public.messages;
DROP POLICY IF EXISTS "Users can read messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.messages;

-- Now safely update matches table structure
ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS user_a UUID,
  ADD COLUMN IF NOT EXISTS user_b UUID;

-- Migrate existing matches data
UPDATE public.matches 
SET user_a = LEAST(user1_id, user2_id),
    user_b = GREATEST(user1_id, user2_id)
WHERE user_a IS NULL;

-- Add foreign key constraints
ALTER TABLE public.matches 
  ADD CONSTRAINT matches_user_a_fkey FOREIGN KEY (user_a) REFERENCES public.profiles(user_id),
  ADD CONSTRAINT matches_user_b_fkey FOREIGN KEY (user_b) REFERENCES public.profiles(user_id);

-- Add unique constraint for user pairs
ALTER TABLE public.matches 
  ADD CONSTRAINT unique_match_pair UNIQUE (user_a, user_b);

-- Now drop old columns
ALTER TABLE public.matches 
  DROP COLUMN IF EXISTS user1_id CASCADE,
  DROP COLUMN IF EXISTS user2_id CASCADE;