-- Script pour créer des likes réciproques avec les faux utilisateurs 1-4
-- Cela va créer des matchs automatiquement

-- Remplacer 'TON_USER_ID_ICI' par ton vrai user_id
-- Tu peux le trouver dans la console du navigateur ou dans les paramètres de ton profil

-- Supprimer les anciens likes s'ils existent
DELETE FROM swipes WHERE swiper_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
) OR swiped_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- Créer des likes réciproques pour les utilisateurs 1-4
-- Les faux utilisateurs ont déjà liké l'utilisateur actuel
INSERT INTO swipes (id, swiper_id, swiped_id, is_like, is_super_like, created_at) VALUES
-- Faux utilisateurs qui ont liké l'utilisateur actuel
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TON_USER_ID_ICI', true, false, NOW() - INTERVAL '2 days'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'TON_USER_ID_ICI', true, false, NOW() - INTERVAL '1 day'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'TON_USER_ID_ICI', true, false, NOW() - INTERVAL '12 hours'),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'TON_USER_ID_ICI', true, false, NOW() - INTERVAL '6 hours');

-- Maintenant, quand l'utilisateur actuel likera ces profils, des matchs seront créés automatiquement

-- Afficher les likes créés
SELECT 
    s.id,
    s.swiper_id,
    s.swiped_id,
    s.is_like,
    s.created_at,
    p.first_name as swiper_name
FROM swipes s
JOIN profiles p ON s.swiper_id = p.user_id
WHERE s.swiper_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
)
ORDER BY s.created_at DESC;
