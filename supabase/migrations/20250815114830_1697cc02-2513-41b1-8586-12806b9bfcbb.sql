-- Fonction de nettoyage automatique des anciens swipes (15 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_swipes()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    deleted_count INTEGER;
    result JSON;
BEGIN
    -- Supprimer les swipes de dislike de plus de 15 jours
    DELETE FROM swipes 
    WHERE created_at < NOW() - INTERVAL '15 days'
    AND is_like = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    result := json_build_object(
        'success', true,
        'deleted_old_dislikes', deleted_count,
        'message', 'Nettoyage des anciens dislikes terminé'
    );

    RETURN result;
END;
$$;

-- Fonction pour retirer un like spécifique (pour le bouton "retirer le like")
CREATE OR REPLACE FUNCTION public.remove_user_like(p_swiper_id uuid, p_swiped_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    deleted_count INTEGER;
    match_deleted INTEGER := 0;
    result JSON;
BEGIN
    -- Supprimer le swipe de like
    DELETE FROM swipes 
    WHERE swiper_id = p_swiper_id 
    AND swiped_id = p_swiped_id 
    AND is_like = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Si le like a été supprimé, vérifier s'il faut supprimer le match
    IF deleted_count > 0 THEN
        -- Supprimer le match s'il n'y a plus de like mutuel
        DELETE FROM matches 
        WHERE (user1_id = p_swiper_id AND user2_id = p_swiped_id)
           OR (user1_id = p_swiped_id AND user2_id = p_swiper_id);
        
        GET DIAGNOSTICS match_deleted = ROW_COUNT;
    END IF;

    result := json_build_object(
        'success', true,
        'like_removed', deleted_count > 0,
        'match_deleted', match_deleted > 0,
        'message', CASE 
            WHEN deleted_count > 0 THEN 'Like retiré avec succès'
            ELSE 'Aucun like trouvé à retirer'
        END
    );

    RETURN result;
END;
$$;