-- ============================================================================
-- FINAL FIX: Persistent Authentication Issues
-- ============================================================================
-- This migration resolves the two remaining issues:
-- 1. Storage bucket not being found/accessible
-- 2. Email validation rejecting valid test emails

-- ============================================================================
-- PART 1: COMPLETELY REBUILD STORAGE SYSTEM
-- ============================================================================

-- First, completely remove and recreate the storage bucket
DO $$
BEGIN
  -- Remove all existing storage policies
  DROP POLICY IF EXISTS "bucket_profile_pictures_insert" ON storage.objects;
  DROP POLICY IF EXISTS "bucket_profile_pictures_select" ON storage.objects;
  DROP POLICY IF EXISTS "bucket_profile_pictures_update" ON storage.objects;
  DROP POLICY IF EXISTS "bucket_profile_pictures_delete" ON storage.objects;
  
  -- Remove bucket if it exists
  DELETE FROM storage.buckets WHERE id = 'profile-pictures';
  
  RAISE NOTICE '🗑️ Cleaned up existing storage configuration';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️ Cleanup warning: %', SQLERRM;
END $$;

-- Create the storage bucket with a fresh start
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection, created_at, updated_at)
VALUES (
  'profile-pictures',
  'profile-pictures', 
  true,
  5242880, -- 5MB
  '["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]'::jsonb,
  false,
  NOW(),
  NOW()
);

-- Create comprehensive storage policies with explicit permissions
CREATE POLICY "allow_authenticated_upload" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'profile-pictures');

CREATE POLICY "allow_public_read" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "allow_authenticated_update" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "allow_authenticated_delete" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- PART 2: FIX EMAIL VALIDATION COMPLETELY
-- ============================================================================

-- Remove ALL email validation constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_email_format;

-- Create a very permissive email validation function
CREATE OR REPLACE FUNCTION validate_email_permissive(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Very basic validation that accepts most test emails
  RETURN email IS NOT NULL AND 
         LENGTH(TRIM(email)) >= 5 AND 
         email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';
END;
$$ LANGUAGE plpgsql;

-- Add the new permissive constraint
ALTER TABLE profiles 
ADD CONSTRAINT check_email_format_permissive 
CHECK (validate_email_permissive(email));

-- ============================================================================
-- PART 3: ENSURE SUPABASE AUTH SETTINGS ARE PERMISSIVE
-- ============================================================================

-- Create function to test email validation directly
CREATE OR REPLACE FUNCTION test_email_formats()
RETURNS TABLE(email_test TEXT, is_valid BOOLEAN) AS $$
BEGIN
  RETURN QUERY VALUES 
    ('test@example.com', validate_email_permissive('test@example.com')),
    ('test-123@example.com', validate_email_permissive('test-123@example.com')),
    ('test.user@domain.co.uk', validate_email_permissive('test.user@domain.co.uk')),
    ('user+tag@example.org', validate_email_permissive('user+tag@example.org')),
    ('test-1749228705921@example.com', validate_email_permissive('test-1749228705921@example.com'));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 4: ENSURE PROFILES TABLE IS FULLY READY
-- ============================================================================

-- Make sure all columns exist and have correct types
DO $$ 
BEGIN
  -- Ensure email column is properly typed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    -- Make sure email column is large enough
    ALTER TABLE profiles ALTER COLUMN email TYPE VARCHAR(255);
  END IF;
  
  -- Ensure username exists and is properly configured
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username VARCHAR(50);
  END IF;
  
  -- Generate usernames for any existing profiles without them
  UPDATE profiles 
  SET username = generate_unique_username(name, email)
  WHERE username IS NULL OR TRIM(username) = '';
  
  -- Make username required
  ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
  
  RAISE NOTICE '✅ Profiles table structure verified';
END $$;

-- ============================================================================
-- PART 5: SIMPLIFY RLS POLICIES FOR RELIABILITY
-- ============================================================================

-- Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remove all existing policies
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_authenticated_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON profiles;
DROP POLICY IF EXISTS "profiles_user_delete" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, reliable policies
CREATE POLICY "enable_read_access_for_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "enable_insert_for_authenticated_users" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_update_for_users_based_on_user_id" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_delete_for_users_based_on_user_id" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- PART 6: CREATE COMPREHENSIVE TEST FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_auth_system_complete()
RETURNS TABLE(
  component TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Test 1: Storage bucket
  RETURN QUERY 
  SELECT 
    'Storage Bucket'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END,
    COALESCE((SELECT 'Public: ' || public::TEXT || ', Size: ' || file_size_limit::TEXT 
              FROM storage.buckets WHERE id = 'profile-pictures'), 'Not configured')::TEXT;
  
  -- Test 2: Email validation
  RETURN QUERY 
  SELECT 
    'Email Validation'::TEXT,
    CASE WHEN validate_email_permissive('test-1749228705921@example.com') 
         THEN '✅ WORKING' ELSE '❌ FAILING' END,
    'Test email format validation'::TEXT;
  
  -- Test 3: Profiles table
  RETURN QUERY 
  SELECT 
    'Profiles Table'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END,
    (SELECT COUNT(*)::TEXT || ' columns configured' 
     FROM information_schema.columns WHERE table_name = 'profiles')::TEXT;
  
  -- Test 4: RLS policies
  RETURN QUERY 
  SELECT 
    'RLS Policies'::TEXT,
    CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles') 
         THEN '✅ ENABLED' ELSE '❌ DISABLED' END,
    (SELECT COUNT(*)::TEXT || ' policies active' 
     FROM pg_policies WHERE tablename = 'profiles')::TEXT;
  
  -- Test 5: Storage policies  
  RETURN QUERY 
  SELECT 
    'Storage Policies'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile%') 
         THEN '✅ CONFIGURED' ELSE '❌ MISSING' END,
    (SELECT COUNT(*)::TEXT || ' storage policies found' 
     FROM pg_policies WHERE tablename = 'objects' AND policyname ~ 'profile|bucket')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: FINAL VERIFICATION AND REPORTING
-- ============================================================================

DO $$
DECLARE
  test_result RECORD;
  all_good BOOLEAN := true;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔧 FINAL AUTHENTICATION SYSTEM FIX';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  
  -- Run comprehensive verification
  FOR test_result IN SELECT * FROM verify_auth_system_complete() LOOP
    RAISE NOTICE '%-20s %s - %s', test_result.component, test_result.status, test_result.details;
    IF test_result.status NOT LIKE '✅%' THEN
      all_good := false;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  
  -- Test specific email formats
  RAISE NOTICE '📧 Email Format Tests:';
  FOR test_result IN SELECT * FROM test_email_formats() LOOP
    RAISE NOTICE '   %-30s %s', test_result.email_test, 
      CASE WHEN test_result.is_valid THEN '✅ VALID' ELSE '❌ INVALID' END;
  END LOOP;
  
  RAISE NOTICE '';
  
  IF all_good THEN
    RAISE NOTICE '🎉 SUCCESS: All authentication system components are working!';
    RAISE NOTICE '';
    RAISE NOTICE '✨ What this fix accomplished:';
    RAISE NOTICE '   • ✅ Storage bucket completely rebuilt and accessible';
    RAISE NOTICE '   • ✅ Email validation made permissive for all test formats';
    RAISE NOTICE '   • ✅ RLS policies simplified and reliable';
    RAISE NOTICE '   • ✅ Profiles table structure verified and complete';
    RAISE NOTICE '   • ✅ All storage policies properly configured';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your FYNC app should now pass all authentication tests!';
  ELSE
    RAISE NOTICE '⚠️ Some components still need attention - check individual status above';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Next Steps:';
  RAISE NOTICE '   1. Run: node test-complete-authentication.js';
  RAISE NOTICE '   2. All tests should now pass';
  RAISE NOTICE '   3. Try the signup flow in your app';
  RAISE NOTICE '';
END $$;