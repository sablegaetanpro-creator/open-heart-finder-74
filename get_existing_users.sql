-- Script pour récupérer les utilisateurs existants
-- Copie ce script et exécute-le dans ton dashboard Supabase SQL Editor

-- Récupérer tous les utilisateurs auth
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- Récupérer tous les profils
SELECT 
    id,
    user_id,
    first_name,
    email,
    age,
    gender,
    looking_for,
    relationship_type,
    profile_photo_url,
    bio,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- Récupérer les matches existants
SELECT 
    id,
    user1_id,
    user2_id,
    created_at
FROM matches 
ORDER BY created_at DESC;

-- Récupérer les swipes existants
SELECT 
    id,
    swiper_id,
    swiped_id,
    is_like,
    created_at
FROM swipes 
ORDER BY created_at DESC;
