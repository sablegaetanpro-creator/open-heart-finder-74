-- Add missing foreign key constraints to the swipes table
-- This will enable proper JOINs in Supabase queries

-- Add foreign key for swiper_id referencing profiles
ALTER TABLE public.swipes 
ADD CONSTRAINT swipes_swiper_id_fkey 
FOREIGN KEY (swiper_id) REFERENCES public.profiles(user_id);

-- Add foreign key for swiped_id referencing profiles  
ALTER TABLE public.swipes 
ADD CONSTRAINT swipes_swiped_id_fkey 
FOREIGN KEY (swiped_id) REFERENCES public.profiles(user_id);

-- Add missing foreign key constraints to the matches table
-- Add foreign key for user1_id referencing profiles
ALTER TABLE public.matches 
ADD CONSTRAINT matches_user1_id_fkey 
FOREIGN KEY (user1_id) REFERENCES public.profiles(user_id);

-- Add foreign key for user2_id referencing profiles
ALTER TABLE public.matches 
ADD CONSTRAINT matches_user2_id_fkey 
FOREIGN KEY (user2_id) REFERENCES public.profiles(user_id);

-- Add foreign key for messages table referencing matches
ALTER TABLE public.messages 
ADD CONSTRAINT messages_match_id_fkey 
FOREIGN KEY (match_id) REFERENCES public.matches(id);

-- Add foreign key for messages sender referencing profiles
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id);