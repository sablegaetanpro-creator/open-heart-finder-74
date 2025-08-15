-- Créer des données de test pour les swipes et likes
-- D'abord récupérer les IDs d'utilisateurs existants
DO $$
DECLARE
    user_ids uuid[];
    current_user_id uuid;
    other_user_id uuid;
    i int;
BEGIN
    -- Récupérer tous les user_ids des profils existants
    SELECT array_agg(user_id) INTO user_ids FROM profiles WHERE is_profile_complete = true;
    
    -- Si on a des utilisateurs, créer quelques swipes de test
    IF array_length(user_ids, 1) > 1 THEN
        -- Prendre le premier utilisateur comme utilisateur actuel
        current_user_id := user_ids[1];
        
        -- Créer quelques likes reçus pour cet utilisateur
        FOR i IN 2..LEAST(array_length(user_ids, 1), 4) LOOP
            other_user_id := user_ids[i];
            
            -- Insérer un swipe like vers l'utilisateur actuel
            INSERT INTO swipes (swiper_id, swiped_id, is_like, is_super_like, created_at)
            VALUES (
                other_user_id,
                current_user_id,
                true,
                false,
                now() - (i * interval '1 hour')
            )
            ON CONFLICT DO NOTHING;
            
            -- Créer aussi quelques likes donnés par l'utilisateur actuel
            INSERT INTO swipes (swiper_id, swiped_id, is_like, is_super_like, created_at)
            VALUES (
                current_user_id,
                other_user_id,
                true,
                false,
                now() - (i * interval '2 hours')
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Créer quelques dislikes aussi pour plus de réalisme
        FOR i IN 2..LEAST(array_length(user_ids, 1), 3) LOOP
            other_user_id := user_ids[i];
            
            INSERT INTO swipes (swiper_id, swiped_id, is_like, is_super_like, created_at)
            VALUES (
                current_user_id,
                other_user_id,
                false,
                false,
                now() - (i * interval '3 hours')
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;