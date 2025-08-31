-- Create comprehensive test data with proper JPG URLs
DO $$
DECLARE
    target_user_id UUID := 'e549a37e-56e2-44f6-b275-6f05bc4728a3';
    fake_user_ids UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222', 
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '66666666-6666-6666-6666-666666666666',
        '77777777-7777-7777-7777-777777777777',
        '88888888-8888-8888-8888-888888888888',
        '99999999-9999-9999-9999-999999999999',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ];
BEGIN
    -- Clear existing test data 
    DELETE FROM messages WHERE sender_id = ANY(fake_user_ids) OR sender_id = target_user_id;
    DELETE FROM matches WHERE user1_id = ANY(fake_user_ids) OR user2_id = ANY(fake_user_ids);
    DELETE FROM swipes WHERE swiper_id = ANY(fake_user_ids) OR swiped_id = ANY(fake_user_ids);
    DELETE FROM profiles WHERE user_id = ANY(fake_user_ids);

    -- Create 12 diverse fake profiles 
    INSERT INTO profiles (user_id, email, first_name, age, gender, looking_for, relationship_type, smoker, animals, children, profile_photo_url, bio, profession, interests, height, education, exercise_frequency, drinks, additional_photos, is_profile_complete) VALUES
    (fake_user_ids[1], 'marie.dubois@test.fr', 'Marie', 26, 'femme', 'homme', 'couple_long_terme', false, 'aime_animaux', 'veut_enfants', 'https://picsum.photos/400/600.jpg', 'Passionnée de yoga et de voyage. À la recherche de quelqu''un avec qui partager mes aventures ! ✈️🧘‍♀️', 'Designer graphique', ARRAY['Yoga', 'Voyage', 'Photographie', 'Cuisine'], 165, 'Master en Design', 'souvent', 'socialement', ARRAY['https://picsum.photos/401/601.jpg'], true),
    
    (fake_user_ids[2], 'claire.martin@test.fr', 'Claire', 24, 'femme', 'homme', 'couple_court_terme', false, 'veut_animaux', 'ne_veut_pas_enfants', 'https://picsum.photos/402/602.jpg', 'Amoureuse des livres et du cinéma indie. Toujours partante pour découvrir un nouveau restaurant ! 📚🎬', 'Journaliste', ARRAY['Lecture', 'Cinéma', 'Gastronomie', 'Écriture'], 158, 'École de journalisme', 'parfois', 'regulierement', ARRAY['https://picsum.photos/403/603.jpg'], true),
    
    (fake_user_ids[3], 'sophie.bernard@test.fr', 'Sophie', 29, 'femme', 'homme', 'couple_long_terme', false, 'aime_animaux', 'a_enfants', 'https://picsum.photos/404/604.jpg', 'Maman épanouie, entrepreneuse passionnée. Cherche quelqu''un de mature pour construire ensemble 💪👩‍💼', 'Consultante RH', ARRAY['Management', 'Fitness', 'Développement personnel', 'Famille'], 172, 'Business School', 'tous_les_jours', 'rarement', ARRAY['https://picsum.photos/405/605.jpg'], true),

    (fake_user_ids[4], 'lucas.petit@test.fr', 'Lucas', 28, 'homme', 'femme', 'couple_court_terme', true, 'veut_animaux', 'veut_enfants', 'https://picsum.photos/406/606.jpg', 'Musicien le soir, développeur le jour. Toujours avec une guitare pas loin ! 🎸💻', 'Développeur web', ARRAY['Musique', 'Technologie', 'Concert', 'Guitare'], 182, 'École d''ingénieur', 'parfois', 'regulierement', ARRAY['https://picsum.photos/407/607.jpg'], true),

    (fake_user_ids[5], 'emma.moreau@test.fr', 'Emma', 25, 'femme', 'homme', 'couple_long_terme', false, 'aime_animaux', 'veut_enfants', 'https://picsum.photos/408/608.jpg', 'Instit passionnée, grande voyageuse. J''aime les âmes créatives et les discussions profondes 🌍📖', 'Institutrice', ARRAY['Éducation', 'Voyage', 'Art', 'Nature'], 160, 'Master MEEF', 'souvent', 'socialement', ARRAY['https://picsum.photos/409/609.jpg'], true),

    (fake_user_ids[6], 'julien.roux@test.fr', 'Julien', 31, 'homme', 'femme', 'couple_long_terme', false, 'aime_animaux', 'veut_enfants', 'https://picsum.photos/410/610.jpg', 'Chirurgien-dentiste, passionné de trail et de montagne. Recherche une complice pour les aventures ! ⛰️🏃‍♂️', 'Chirurgien-dentiste', ARRAY['Trail', 'Montagne', 'Médecine', 'Nature'], 178, 'Faculté de médecine dentaire', 'tous_les_jours', 'rarement', ARRAY['https://picsum.photos/411/611.jpg'], true),

    (fake_user_ids[7], 'camille.blanc@test.fr', 'Camille', 27, 'femme', 'homme', 'couple_court_terme', false, 'veut_animaux', 'ne_veut_pas_enfants', 'https://picsum.photos/412/612.jpg', 'Architecte créative, amoureuse des espaces et des formes. Fan de brunchs et de balades urbaines ! 🏗️☕', 'Architecte', ARRAY['Architecture', 'Design', 'Art urbain', 'Photographie'], 168, 'École d''architecture', 'souvent', 'socialement', ARRAY['https://picsum.photos/413/613.jpg'], true),

    (fake_user_ids[8], 'antoine.durand@test.fr', 'Antoine', 26, 'homme', 'femme', 'couple_long_terme', false, 'ne_veut_pas_animaux', 'veut_enfants', 'https://picsum.photos/414/614.jpg', 'Comptable passionné de cuisine et de bons vins. Je cherche quelqu''un avec qui partager mes plats ! 🍷👨‍🍳', 'Expert-comptable', ARRAY['Cuisine', 'Vin', 'Gastronomie', 'Voyage'], 175, 'Master CCA', 'parfois', 'socialement', ARRAY['https://picsum.photos/415/615.jpg'], true),

    (fake_user_ids[9], 'léa.simon@test.fr', 'Léa', 23, 'femme', 'homme', 'couple_court_terme', false, 'veut_animaux', 'ne_veut_pas_enfants', 'https://picsum.photos/416/616.jpg', 'Étudiante en master, danseuse dans l''âme. Toujours partante pour sortir et découvrir ! 💃🎓', 'Étudiante en communication', ARRAY['Danse', 'Sortie', 'Mode', 'Musique'], 162, 'Master en cours', 'souvent', 'regulierement', ARRAY['https://picsum.photos/417/617.jpg'], true),

    (fake_user_ids[10], 'maxime.garcia@test.fr', 'Maxime', 30, 'homme', 'femme', 'couple_long_terme', true, 'aime_animaux', 'a_enfants', 'https://picsum.photos/418/618.jpg', 'Papa aimant, ingénieur passionné. Je recherche une femme pour construire une belle famille ensemble 👨‍👧‍👦❤️', 'Ingénieur', ARRAY['Famille', 'Technologie', 'Sport', 'Bricolage'], 185, 'École d''ingénieur', 'souvent', 'rarement', ARRAY['https://picsum.photos/419/619.jpg'], true),

    (fake_user_ids[11], 'sarah.lopez@test.fr', 'Sarah', 28, 'femme', 'homme', 'couple_long_terme', false, 'aime_animaux', 'veut_enfants', 'https://picsum.photos/420/620.jpg', 'Vétérinaire de cœur, amoureuse des animaux et de la nature. Cherche quelqu''un qui partage mes valeurs ! 🐕🌿', 'Vétérinaire', ARRAY['Animaux', 'Nature', 'Écologie', 'Randonnée'], 170, 'École vétérinaire', 'souvent', 'rarement', ARRAY['https://picsum.photos/421/621.jpg'], true),

    (fake_user_ids[12], 'thomas.david@test.fr', 'Thomas', 29, 'homme', 'femme', 'amitie', false, 'ne_veut_pas_animaux', 'ne_veut_pas_enfants', 'https://picsum.photos/422/622.jpg', 'Photographe freelance, toujours en quête du cliché parfait. Aime les voyages et les rencontres authentiques ! 📸✈️', 'Photographe', ARRAY['Photographie', 'Voyage', 'Art', 'Freelance'], 180, 'École de photographie', 'parfois', 'socialement', ARRAY['https://picsum.photos/423/623.jpg'], true);

    -- 1. LIKES GIVEN (Gaëtan has liked these profiles)
    INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
    (target_user_id, fake_user_ids[1], true, NOW() - INTERVAL '2 days'),
    (target_user_id, fake_user_ids[2], true, NOW() - INTERVAL '1 day'),
    (target_user_id, fake_user_ids[3], true, NOW() - INTERVAL '3 hours'),
    (target_user_id, fake_user_ids[4], true, NOW() - INTERVAL '1 hour'),
    (target_user_id, fake_user_ids[5], true, NOW() - INTERVAL '30 minutes');

    -- 2. LIKES RECEIVED (These profiles have liked Gaëtan)
    INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
    (fake_user_ids[6], target_user_id, true, NOW() - INTERVAL '4 days'),
    (fake_user_ids[7], target_user_id, true, NOW() - INTERVAL '3 days'),
    (fake_user_ids[8], target_user_id, true, NOW() - INTERVAL '2 days'),
    (fake_user_ids[9], target_user_id, true, NOW() - INTERVAL '1 day'),
    (fake_user_ids[10], target_user_id, true, NOW() - INTERVAL '12 hours'),
    (fake_user_ids[11], target_user_id, true, NOW() - INTERVAL '6 hours'),
    (fake_user_ids[12], target_user_id, true, NOW() - INTERVAL '2 hours');

    -- 3. MUTUAL MATCHES (Both liked each other)
    INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at) VALUES
    (fake_user_ids[1], target_user_id, true, NOW() - INTERVAL '1 day 12 hours'), -- Marie likes back
    (fake_user_ids[3], target_user_id, true, NOW() - INTERVAL '2 hours 30 minutes'), -- Sophie likes back
    (fake_user_ids[5], target_user_id, true, NOW() - INTERVAL '20 minutes'); -- Emma likes back

    -- Create the matches manually
    INSERT INTO matches (user1_id, user2_id, created_at) VALUES
    (LEAST(target_user_id, fake_user_ids[1]), GREATEST(target_user_id, fake_user_ids[1]), NOW() - INTERVAL '1 day 12 hours'),
    (LEAST(target_user_id, fake_user_ids[3]), GREATEST(target_user_id, fake_user_ids[3]), NOW() - INTERVAL '2 hours 30 minutes'),
    (LEAST(target_user_id, fake_user_ids[5]), GREATEST(target_user_id, fake_user_ids[5]), NOW() - INTERVAL '20 minutes')
    ON CONFLICT DO NOTHING;

    -- 4. CREATE MESSAGE CONVERSATIONS
    -- Messages with Marie (match 1)
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, fake_user_ids[1], 'Salut Gaëtan ! J''ai vu qu''on avait matché ! Comment ça va ? 😊', NOW() - INTERVAL '1 day 11 hours'
    FROM matches m WHERE (m.user1_id = LEAST(target_user_id, fake_user_ids[1]) AND m.user2_id = GREATEST(target_user_id, fake_user_ids[1]));
    
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, target_user_id, 'Coucou Marie ! Très bien merci, et toi ? Ton profil m''a tout de suite plu ! ✨', NOW() - INTERVAL '1 day 10 hours'
    FROM matches m WHERE (m.user1_id = LEAST(target_user_id, fake_user_ids[1]) AND m.user2_id = GREATEST(target_user_id, fake_user_ids[1]));
    
    -- Messages with Sophie (match 2)  
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, fake_user_ids[3], 'Hello ! 👋 C''est cool qu''on ait matché ! Tu fais quoi comme travail ?', NOW() - INTERVAL '2 hours'
    FROM matches m WHERE (m.user1_id = LEAST(target_user_id, fake_user_ids[3]) AND m.user2_id = GREATEST(target_user_id, fake_user_ids[3]));
    
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, target_user_id, 'Salut Sophie ! Je travaille dans le développement web. Et toi tu es consultante RH c''est ça ?', NOW() - INTERVAL '1 hour 45 minutes'
    FROM matches m WHERE (m.user1_id = LEAST(target_user_id, fake_user_ids[3]) AND m.user2_id = GREATEST(target_user_id, fake_user_ids[3]));

    -- Messages with Emma (match 3) - most recent
    INSERT INTO messages (match_id, sender_id, content, created_at) 
    SELECT m.id, fake_user_ids[5], 'Coucou ! 😊 Quel match parfait ! Tu aimes voyager ?', NOW() - INTERVAL '15 minutes'
    FROM matches m WHERE (m.user1_id = LEAST(target_user_id, fake_user_ids[5]) AND m.user2_id = GREATEST(target_user_id, fake_user_ids[5]));

END $$;