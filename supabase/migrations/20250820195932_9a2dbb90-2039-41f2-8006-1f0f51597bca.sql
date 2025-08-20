-- Create test swipes data for likes given
-- Assuming the current user is one of the existing profiles, let's create some test data

-- First, let's see who's the current user by getting the most recent profile
-- Then create 2 swipes from that user to other users

INSERT INTO public.swipes (swiper_id, swiped_id, is_like, created_at) 
VALUES 
  ('e549a37e-56e2-44f6-b275-6f05bc4728a3', '74f9f86f-f947-46d5-a91b-bba547acae64', true, now() - interval '1 hour'),
  ('e549a37e-56e2-44f6-b275-6f05bc4728a3', '7a08ab5f-3cd3-4d50-b146-83d0acc24bb2', true, now() - interval '30 minutes')
ON CONFLICT (swiper_id, swiped_id) DO NOTHING;