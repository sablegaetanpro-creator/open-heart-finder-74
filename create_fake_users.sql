-- Script pour créer des faux utilisateurs de test
-- Utilisateurs 1-4 : déjà likés par l'utilisateur actuel
-- Utilisateurs 5-8 : pas encore likés (visibles dans les suggestions)

-- Supprimer les anciens faux utilisateurs s'ils existent
DELETE FROM profiles WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);
DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- Créer les faux utilisateurs dans auth.users avec des UUID valides
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
('11111111-1111-1111-1111-111111111111', 'user1@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('22222222-2222-2222-2222-222222222222', 'user2@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('33333333-3333-3333-3333-333333333333', 'user3@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('44444444-4444-4444-4444-444444444444', 'user4@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('55555555-5555-5555-5555-555555555555', 'user5@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('66666666-6666-6666-6666-666666666666', 'user6@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('77777777-7777-7777-7777-777777777777', 'user7@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('88888888-8888-8888-8888-888888888888', 'user8@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '');

-- Créer les profils pour ces utilisateurs avec toutes les colonnes obligatoires
INSERT INTO profiles (
  id, user_id, email, first_name, age, gender, looking_for, relationship_type, 
  smoker, animals, children, profile_photo_url, bio, max_distance, 
  is_profile_complete, created_at, updated_at
) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'user1@test.com', 'Emma', 24, 'femme', 'homme', 'relation_serieuse', false, 'aime_animaux', 'veut_enfants', 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Emma', 'J''aime voyager et découvrir de nouveaux endroits. Passionnée de photographie et de cuisine.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'user2@test.com', 'Lucas', 28, 'homme', 'femme', 'relation_serieuse', false, 'aime_animaux', 'pas_sur', 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Lucas', 'Sportif et aventurier. J''adore la randonnée en montagne et les sports extrêmes.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'user3@test.com', 'Sophie', 26, 'femme', 'homme', 'relation_serieuse', false, 'aime_animaux', 'veut_enfants', 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Sophie', 'Artiste peintre et amoureuse de la nature. Je cherche quelqu''un qui partage ma passion pour l''art.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'user4@test.com', 'Thomas', 30, 'homme', 'femme', 'relation_serieuse', false, 'aime_animaux', 'pas_sur', 'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Thomas', 'Ingénieur informatique passionné de musique. Je joue de la guitare et j''adore les concerts.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'user5@test.com', 'Julie', 25, 'femme', 'homme', 'relation_serieuse', false, 'aime_animaux', 'veut_enfants', 'https://via.placeholder.com/400x400/FFEAA7/000000?text=Julie', 'Professeure de yoga et amoureuse de la vie. Je cherche une connexion authentique.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'user6@test.com', 'Alexandre', 29, 'homme', 'femme', 'relation_serieuse', false, 'aime_animaux', 'pas_sur', 'https://via.placeholder.com/400x400/DDA0DD/FFFFFF?text=Alexandre', 'Chef cuisinier passionné. J''aime créer des plats délicieux et partager de bons moments.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'user7@test.com', 'Camille', 27, 'femme', 'homme', 'relation_serieuse', false, 'aime_animaux', 'veut_enfants', 'https://via.placeholder.com/400x400/98D8C8/FFFFFF?text=Camille', 'Médecin et amoureuse des animaux. J''ai deux chats et j''adore la lecture.', 50, true, NOW(), NOW()),
(gen_random_uuid(), '88888888-8888-8888-8888-888888888888', 'user8@test.com', 'Nicolas', 31, 'homme', 'femme', 'relation_serieuse', false, 'aime_animaux', 'pas_sur', 'https://via.placeholder.com/400x400/F7DC6F/000000?text=Nicolas', 'Architecte créatif. J''aime dessiner, voyager et découvrir de nouvelles cultures.', 50, true, NOW(), NOW());

-- Afficher les utilisateurs créés
SELECT 
    p.user_id,
    p.first_name,
    p.age,
    p.gender,
    p.looking_for,
    p.relationship_type,
    p.bio,
    p.profile_photo_url
FROM profiles p 
WHERE p.user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
)
ORDER BY p.user_id;
