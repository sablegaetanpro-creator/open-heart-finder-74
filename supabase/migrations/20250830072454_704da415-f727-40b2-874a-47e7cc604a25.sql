-- Fix the animals constraint error by using correct values
-- Check what the valid values should be
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%animals%' OR constraint_name LIKE '%check%';