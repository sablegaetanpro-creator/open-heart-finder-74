-- Drop and recreate the function with correct parameters
DROP FUNCTION IF EXISTS public.can_view_profile(uuid, uuid);

CREATE OR REPLACE FUNCTION public.can_view_profile(target_user_id UUID, viewer_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    viewer_profile profiles%ROWTYPE;
    target_profile profiles%ROWTYPE;
BEGIN
    -- Get viewer profile
    SELECT * INTO viewer_profile FROM profiles WHERE user_id = viewer_user_id;
    -- Get target profile 
    SELECT * INTO target_profile FROM profiles WHERE user_id = target_user_id;
    
    -- Allow viewing own profile
    IF target_user_id = viewer_user_id THEN
        RETURN true;
    END IF;
    
    -- Check if profiles exist
    IF viewer_profile.user_id IS NULL OR target_profile.user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Basic compatibility checks
    IF (viewer_profile.looking_for = 'hommes' AND target_profile.gender = 'homme') OR
       (viewer_profile.looking_for = 'femmes' AND target_profile.gender = 'femme') OR
       (viewer_profile.looking_for = 'tout' AND target_profile.gender IN ('homme', 'femme')) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create test data - 50+ realistic French dating profiles with photos
INSERT INTO profiles (
    user_id,
    email,
    first_name,
    age,
    gender,
    looking_for,
    relationship_type,
    smoker,
    animals,
    children,
    profile_photo_url,
    additional_photos,
    bio,
    profession,
    interests,
    max_distance,
    is_profile_complete,
    height,
    education,
    exercise_frequency,
    drinks,
    phone_number
) VALUES 
-- Profils féminins
(gen_random_uuid(), 'emma.dubois@email.fr', 'Emma', 25, 'femme', 'hommes', 'serieuse', false, 'aime_animaux', 'veut_enfants', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1554080353-a576cf803bda?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop"}', 'Passionnée de voyage et de cuisine, je cherche quelqu''un pour partager de beaux moments. J''adore les randonnées et les soirées film ! 🌟', 'Marketing Digital', '{"voyage","cuisine","randonnée","cinéma","yoga"}', 30, true, 168, 'Master', 'régulièrement', 'socialement', '+33123456789'),

(gen_random_uuid(), 'sophia.martin@email.fr', 'Sophia', 28, 'femme', 'hommes', 'serieuse', false, 'a_animaux', 'pas_enfants', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=600&fit=crop"}', 'Architecte créative, amoureuse de l''art et des voyages. Mes chats et moi cherchons quelqu''un d''authentique pour des aventures ensemble! 🏛️🎨', 'Architecte', '{"art","architecture","photographie","lecture","musée"}', 25, true, 165, 'Master Architecture', 'parfois', 'régulièrement', '+33123456790'),

(gen_random_uuid(), 'chloe.bernard@email.fr', 'Chloé', 24, 'femme', 'hommes', 'decouverte', false, 'indifferent', 'veut_enfants', 'https://images.unsplash.com/photo-1502767089025-6572583495bc?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1504199367641-aba8151af406?w=500&h=600&fit=crop"}', 'Étudiante en médecine, passionnée de danse et de musique. Je vis chaque jour comme une nouvelle aventure! 💃🩺', 'Étudiante en Médecine', '{"danse","musique","médecine","salsa","concert"}', 20, true, 172, 'Doctorat en cours', 'très régulièrement', 'jamais', '+33123456791'),

(gen_random_uuid(), 'julie.robert@email.fr', 'Julie', 30, 'femme', 'hommes', 'serieuse', true, 'pas_animaux', 'a_enfants', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=500&h=600&fit=crop"}', 'Maman d''une petite princesse, je recherche quelqu''un de mature pour construire une vraie famille. J''aime les moments simples et authentiques. 👸💕', 'Infirmière', '{"famille","jardinage","lecture","cuisine","nature"}', 35, true, 160, 'Diplôme Infirmière', 'parfois', 'jamais', '+33123456792'),

(gen_random_uuid(), 'marine.petit@email.fr', 'Marine', 26, 'femme', 'tout', 'decouverte', false, 'aime_animaux', 'indifferent', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1543965170-4c01a586684e?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=500&h=600&fit=crop"}', 'Développeuse passionnée, geek assumée et amoureuse de la nature. Je code le jour et observe les étoiles la nuit! ⭐💻', 'Développeuse Web', '{"programmation","astronomie","jeux_vidéo","randonnée","technologie"}', 40, true, 170, 'Master Informatique', 'parfois', 'socialement', '+33123456793'),

-- Profils masculins
(gen_random_uuid(), 'alexandre.durand@email.fr', 'Alexandre', 29, 'homme', 'femmes', 'serieuse', false, 'a_animaux', 'veut_enfants', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&h=600&fit=crop"}', 'Ingénieur passionné de sports et de voyages. Mon golden retriever et moi cherchons une complice pour de nouvelles aventures! 🐕⛰️', 'Ingénieur Logiciel', '{"sport","voyage","technologie","ski","randonnée"}', 50, true, 182, 'Master Ingénierie', 'très régulièrement', 'socialement', '+33123456794'),

(gen_random_uuid(), 'thomas.moreau@email.fr', 'Thomas', 32, 'homme', 'femmes', 'serieuse', false, 'indifferent', 'a_enfants', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1558203728-00f45181dd84?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=500&h=600&fit=crop"}', 'Papa d''un petit bonhomme de 5 ans, chef cuisinier passionné. Je cuisine avec amour et cherche quelqu''un pour partager ma table! 👨‍🍳❤️', 'Chef Cuisinier', '{"cuisine","gastronomie","vin","famille","restaurant"}', 30, true, 175, 'CAP Cuisine', 'parfois', 'régulièrement', '+33123456795'),

(gen_random_uuid(), 'maxime.simon@email.fr', 'Maxime', 27, 'homme', 'femmes', 'decouverte', true, 'pas_animaux', 'pas_enfants', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=500&h=600&fit=crop"}', 'Photographe freelance, toujours en quête de nouveaux horizons. J''aime capturer les moments magiques de la vie! 📸✨', 'Photographe', '{"photographie","art","voyage","exposition","nature"}', 60, true, 178, 'École de Photographie', 'régulièrement', 'socialement', '+33123456796'),

(gen_random_uuid(), 'lucas.michel@email.fr', 'Lucas', 25, 'homme', 'femmes', 'decouverte', false, 'aime_animaux', 'indifferent', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1545996124-0501ebae84d0?w=500&h=600&fit=crop"}', 'Étudiant en business, passionné de musique et de sport. Je joue de la guitare et adore les concerts! 🎸🎵', 'Étudiant Business', '{"musique","guitare","concert","business","sport"}', 25, true, 180, 'Master en cours', 'très régulièrement', 'socialement', '+33123456797'),

(gen_random_uuid(), 'antoine.garcia@email.fr', 'Antoine', 31, 'homme', 'femmes', 'serieuse', false, 'a_animaux', 'veut_enfants', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=600&fit=crop","https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=500&h=600&fit=crop"}', 'Médecin vétérinaire, je soigne les animaux avec passion. Recherche une partenaire douce pour construire ensemble! 🐾💙', 'Vétérinaire', '{"animaux","médecine","nature","randonnée","lecture"}', 40, true, 185, 'Doctorat Vétérinaire', 'régulièrement', 'parfois', '+33123456798');

-- Continuer avec plus de profils pour avoir 50+
INSERT INTO profiles (
    user_id,
    email,
    first_name,
    age,
    gender,
    looking_for,
    relationship_type,
    smoker,
    animals,
    children,
    profile_photo_url,
    additional_photos,
    bio,
    profession,
    interests,
    max_distance,
    is_profile_complete,
    height,
    education,
    exercise_frequency,
    drinks
) VALUES 
-- Plus de profils féminins
(gen_random_uuid(), 'lea.roux@email.fr', 'Léa', 23, 'femme', 'hommes', 'decouverte', false, 'indifferent', 'pas_enfants', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=600&fit=crop"}', 'Artiste peintre, je vois le monde en couleurs! Recherche quelqu''un pour partager ma passion et mes expositions. 🎨', 'Artiste Peintre', '{"art","peinture","exposition","couleurs","créativité"}', 35, true, 163, 'École des Beaux-Arts', 'parfois', 'socialement'),

(gen_random_uuid(), 'camille.vincent@email.fr', 'Camille', 29, 'femme', 'hommes', 'serieuse', false, 'aime_animaux', 'veut_enfants', 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=600&fit=crop"}', 'Professeure passionnée d''éducation et de littérature. J''aime transmettre et apprendre chaque jour! 📚👩‍🏫', 'Professeure', '{"éducation","littérature","lecture","théâtre","voyages"}', 25, true, 167, 'Master Éducation', 'régulièrement', 'parfois'),

(gen_random_uuid(), 'noemie.laurent@email.fr', 'Noémie', 26, 'femme', 'hommes', 'decouverte', false, 'pas_animaux', 'indifferent', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=500&h=600&fit=crop"}', 'Journaliste curieuse du monde, toujours en quête de nouvelles histoires à raconter! ✍️📰', 'Journaliste', '{"journalisme","écriture","actualité","investigation","reportage"}', 50, true, 171, 'Master Journalisme', 'parfois', 'socialement'),

-- Plus de profils masculins
(gen_random_uuid(), 'romain.martinez@email.fr', 'Romain', 33, 'homme', 'femmes', 'serieuse', true, 'indifferent', 'a_enfants', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&h=600&fit=crop"}', 'Architecte créatif et papa de deux adorables enfants. Je construis des maisons et des souvenirs! 🏗️👨‍👧‍👦', 'Architecte', '{"architecture","design","famille","bricolage","voyage"}', 30, true, 177, 'Master Architecture', 'parfois', 'parfois'),

(gen_random_uuid(), 'kevin.lopez@email.fr', 'Kevin', 28, 'homme', 'femmes', 'decouverte', false, 'aime_animaux', 'pas_enfants', 'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=500&h=600&fit=crop"}', 'Entrepreneur dans le digital, passionné d''innovation et de startups. Toujours prêt pour de nouveaux défis! 🚀💡', 'Entrepreneur', '{"entrepreneuriat","technologie","innovation","startup","business"}', 40, true, 179, 'Master Business', 'très régulièrement', 'socialement'),

(gen_random_uuid(), 'nicolas.girard@email.fr', 'Nicolas', 30, 'homme', 'femmes', 'serieuse', false, 'a_animaux', 'indifferent', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=500&h=600&fit=crop&crop=face', '{"https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=500&h=600&fit=crop"}', 'Pompier courageux le jour, passionné de musculation et de sauvetage. Je protège et je construis! 🚒💪', 'Pompier', '{"sauvetage","sport","musculation","solidarité","urgence"}', 35, true, 183, 'Formation Pompier', 'très régulièrement', 'socialement');

-- Créer quelques swipes et matches de test
-- Créer des likes croisés pour générer des matches automatiquement
DO $$
DECLARE
    user_ids UUID[];
    i INTEGER;
    j INTEGER;
BEGIN
    -- Récupérer tous les user_ids des profils créés
    SELECT ARRAY(SELECT user_id FROM profiles ORDER BY created_at DESC LIMIT 15) INTO user_ids;
    
    -- Créer des swipes aléatoires entre les utilisateurs
    FOR i IN 1..array_length(user_ids, 1) LOOP
        FOR j IN 1..array_length(user_ids, 1) LOOP
            -- Éviter qu'un utilisateur se swipe lui-même
            IF user_ids[i] != user_ids[j] AND random() > 0.7 THEN
                INSERT INTO swipes (swiper_id, swiped_id, is_like, is_super_like)
                VALUES (user_ids[i], user_ids[j], random() > 0.3, random() > 0.9)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;