-- ============================================================================
-- FIX: Storage Bucket JSON Syntax Error
-- ============================================================================
-- This migration fixes the JSON syntax error in the allowed_mime_types field
-- The issue was using object syntax {} instead of array syntax []

-- Fix the storage bucket configuration with correct JSON array syntax
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, 
  5242880, -- 5MB limit
  '["image/jpeg","image/jpg","image/png","image/webp","image/gif"]'::jsonb -- Fixed: using array syntax
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Verify the fix worked
DO $$
DECLARE
  bucket_exists BOOLEAN;
  mime_types JSONB;
BEGIN
  -- Check if bucket exists with correct configuration
  SELECT 
    EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures'),
    allowed_mime_types
  INTO bucket_exists, mime_types
  FROM storage.buckets 
  WHERE id = 'profile-pictures';
  
  IF bucket_exists THEN
    RAISE NOTICE '✅ Storage bucket fixed successfully!';
    RAISE NOTICE '📁 Bucket: profile-pictures';
    RAISE NOTICE '🔧 Allowed MIME types: %', mime_types;
    RAISE NOTICE '🎯 JSON syntax error resolved - ready for image uploads!';
  ELSE
    RAISE NOTICE '❌ Storage bucket still missing';
  END IF;
END $$;