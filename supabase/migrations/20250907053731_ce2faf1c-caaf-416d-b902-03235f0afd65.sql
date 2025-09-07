-- Fix duplicate policy and complete setup
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can create own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can view their own swipes" ON public.swipes;

-- Complete the remaining setup
-- Add unique constraint for swiper/swiped pairs (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_swipe_pair') THEN
        ALTER TABLE public.swipes ADD CONSTRAINT unique_swipe_pair UNIQUE (swiper_id, swiped_id);
    END IF;
END $$;

-- Recreate swipes policies
CREATE POLICY "Users can create own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Users can view their own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);