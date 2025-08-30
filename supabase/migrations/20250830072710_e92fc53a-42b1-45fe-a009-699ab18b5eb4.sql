-- Fix photo URL validation and create test data with simple URLs
-- First, let's see what the validation function expects
SELECT validate_photo_url('https://images.unsplash.com/photo-1494790108755-2616b612b402.jpg') as with_jpg,
       validate_photo_url('') as empty_string,
       validate_photo_url('https://example.com/image.jpg') as simple_url;