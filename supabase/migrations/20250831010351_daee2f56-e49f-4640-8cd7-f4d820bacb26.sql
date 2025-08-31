-- Insert minimal test data manually with correct constraints
-- Clear any existing fake data first
DELETE FROM messages WHERE sender_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.fr'
);
DELETE FROM matches WHERE user1_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.fr'
) OR user2_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.fr'
);
DELETE FROM swipes WHERE swiper_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.fr'
) OR swiped_id IN (
  SELECT user_id FROM profiles WHERE email LIKE '%@test.fr'
);
DELETE FROM profiles WHERE email LIKE '%@test.fr';

-- Insert just a few test profiles with correct constraint values
INSERT INTO profiles (
  user_id, email, first_name, age, gender, looking_for, relationship_type, 
  smoker, animals, children, profile_photo_url, bio, profession, interests, 
  height, education, exercise_frequency, drinks, is_profile_complete
) VALUES
('11111111-1111-1111-1111-111111111111', 'marie@test.fr', 'Marie', 26, 'femme', 'homme', 'couple_long_terme', 
 false, 'aime_animaux', 'veut_enfants', '', 'Passionnée de yoga et voyage', 'Designer', ARRAY['Yoga', 'Voyage'], 
 165, 'Master', 'souvent', 'socialement', true),

('22222222-2222-2222-2222-222222222222', 'emma@test.fr', 'Emma', 25, 'femme', 'homme', 'couple_long_terme', 
 false, 'aime_animaux', 'veut_enfants', '', 'Institutrice passionnée', 'Institutrice', ARRAY['Education', 'Art'], 
 160, 'Master MEEF', 'souvent', 'socialement', true),

('33333333-3333-3333-3333-333333333333', 'julien@test.fr', 'Julien', 31, 'homme', 'femme', 'couple_long_terme', 
 false, 'aime_animaux', 'veut_enfants', '', 'Dentiste sportif', 'Dentiste', ARRAY['Sport', 'Nature'], 
 178, 'Faculté dentaire', 'tous_les_jours', 'rarement', true),

('44444444-4444-4444-4444-444444444444', 'camille@test.fr', 'Camille', 27, 'femme', 'homme', 'couple_court_terme', 
 false, 'ne_veut_pas_animaux', 'ne_veut_pas_enfants', '', 'Architecte créative', 'Architecte', ARRAY['Architecture', 'Art'], 
 168, 'École architecture', 'souvent', 'socialement', true);

-- Get the target user ID for Gaëtan
DO $$
DECLARE
    target_user_id UUID := 'e549a37e-56e2-44f6-b275-6f05bc4728a3';
BEGIN
    -- Likes given by Gaëtan
    INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
    (target_user_id, '11111111-1111-1111-1111-111111111111', true, NOW() - INTERVAL '2 days'),
    (target_user_id, '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '1 hour');

    -- Likes received by Gaëtan  
    INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
    ('33333333-3333-3333-3333-333333333333', target_user_id, true, NOW() - INTERVAL '3 days'),
    ('44444444-4444-4444-4444-444444444444', target_user_id, true, NOW() - INTERVAL '1 day');

    -- Create mutual match with Marie
    INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', target_user_id, true, NOW() - INTERVAL '1 day 12 hours');

    -- Create the match manually
    INSERT INTO matches (user1_id, user2_id, created_at) VALUES
    (LEAST(target_user_id, '11111111-1111-1111-1111-111111111111'), 
     GREATEST(target_user_id, '11111111-1111-1111-1111-111111111111'), 
     NOW() - INTERVAL '1 day 12 hours')
    ON CONFLICT DO NOTHING;

    -- Add test messages for the match
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, '11111111-1111-1111-1111-111111111111', 'Salut Gaëtan ! Comment ça va ? 😊', NOW() - INTERVAL '1 day'
    FROM matches m 
    WHERE (m.user1_id = LEAST(target_user_id, '11111111-1111-1111-1111-111111111111') 
           AND m.user2_id = GREATEST(target_user_id, '11111111-1111-1111-1111-111111111111'));
    
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, target_user_id, 'Coucou Marie ! Ça va bien merci ! ✨', NOW() - INTERVAL '23 hours'
    FROM matches m 
    WHERE (m.user1_id = LEAST(target_user_id, '11111111-1111-1111-1111-111111111111') 
           AND m.user2_id = GREATEST(target_user_id, '11111111-1111-1111-1111-111111111111'));

END $$;