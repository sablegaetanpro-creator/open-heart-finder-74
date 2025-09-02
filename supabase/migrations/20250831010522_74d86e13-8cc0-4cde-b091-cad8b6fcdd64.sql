-- Insert minimal test data with ONLY the valid constraint values
-- Create test data for sable.gaetan.pro@gmail.com using only valid values

-- Clean up first
DELETE FROM messages WHERE sender_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM matches WHERE user1_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222') 
                        OR user2_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM swipes WHERE swiper_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222') 
                       OR swiped_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM profiles WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Insert 2 simple test profiles using ONLY valid constraint values
INSERT INTO profiles (
  user_id, email, first_name, age, gender, looking_for, relationship_type, 
  smoker, animals, children, profile_photo_url, bio, is_profile_complete
) VALUES
('11111111-1111-1111-1111-111111111111', 'marie@test.fr', 'Marie', 26, 'femme', 'homme', 'couple_long_terme', 
 false, 'aime_animaux', 'veut_enfants', '', 'Passionnée de yoga', true),

('22222222-2222-2222-2222-222222222222', 'julien@test.fr', 'Julien', 28, 'homme', 'femme', 'couple_long_terme', 
 false, 'aime_animaux', 'veut_enfants', '', 'Développeur', true);

-- Create test interactions for Gaëtan (e549a37e-56e2-44f6-b275-6f05bc4728a3)
INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
-- Gaëtan likes Marie
('e549a37e-56e2-44f6-b275-6f05bc4728a3', '11111111-1111-1111-1111-111111111111', true, NOW() - INTERVAL '2 days'),
-- Marie likes Gaëtan back (mutual match)
('11111111-1111-1111-1111-111111111111', 'e549a37e-56e2-44f6-b275-6f05bc4728a3', true, NOW() - INTERVAL '1 day'),
-- Julien likes Gaëtan (received like)
('22222222-2222-2222-2222-222222222222', 'e549a37e-56e2-44f6-b275-6f05bc4728a3', true, NOW() - INTERVAL '3 hours');

-- Create match between Gaëtan and Marie
INSERT INTO matches (user1_id, user2_id, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'e549a37e-56e2-44f6-b275-6f05bc4728a3', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Add test messages for the match
INSERT INTO messages (match_id, sender_id, content, created_at) 
SELECT m.id, '11111111-1111-1111-1111-111111111111', 'Salut Gaëtan ! Comment ça va ? 😊', NOW() - INTERVAL '20 hours'
FROM matches m 
WHERE (m.user1_id = '11111111-1111-1111-1111-111111111111' AND m.user2_id = 'e549a37e-56e2-44f6-b275-6f05bc4728a3')
   OR (m.user1_id = 'e549a37e-56e2-44f6-b275-6f05bc4728a3' AND m.user2_id = '11111111-1111-1111-1111-111111111111');

INSERT INTO messages (match_id, sender_id, content, created_at) 
SELECT m.id, 'e549a37e-56e2-44f6-b275-6f05bc4728a3', 'Coucou Marie ! Ça va bien merci ! ✨', NOW() - INTERVAL '19 hours'
FROM matches m 
WHERE (m.user1_id = '11111111-1111-1111-1111-111111111111' AND m.user2_id = 'e549a37e-56e2-44f6-b275-6f05bc4728a3')
   OR (m.user1_id = 'e549a37e-56e2-44f6-b275-6f05bc4728a3' AND m.user2_id = '11111111-1111-1111-1111-111111111111');