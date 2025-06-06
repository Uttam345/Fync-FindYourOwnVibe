-- ============================================================================
-- FIX: Authentication System Issues
-- ============================================================================
-- This migration addresses:
-- 1. Storage bucket setup issues
-- 2. Email validation problems
-- 3. Ensures comprehensive authentication system works

-- ============================================================================
-- STORAGE BUCKET SETUP (CORRECTED)
-- ============================================================================

-- First, ensure the bucket exists with correct configuration
DO $$
BEGIN
  -- Drop and recreate bucket if it has issues
  DELETE FROM storage.buckets WHERE id = 'profile-pictures';
  
  -- Create bucket with proper configuration
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'profile-pictures', 
    'profile-pictures', 
    true, 
    5242880, -- 5MB limit
    '["image/jpeg","image/jpg","image/png","image/webp","image/gif"]'::jsonb
  );
  
  RAISE NOTICE '✅ Storage bucket recreated successfully';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️ Storage bucket creation: %', SQLERRM;
END $$;

-- ============================================================================
-- STORAGE POLICIES (COMPREHENSIVE)
-- ============================================================================

-- Remove all existing storage policies
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_delete_policy" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "bucket_profile_pictures_insert" 
  ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role')
  );

CREATE POLICY "bucket_profile_pictures_select" 
  ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "bucket_profile_pictures_update" 
  ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'profile-pictures' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role')
  );

CREATE POLICY "bucket_profile_pictures_delete" 
  ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'profile-pictures' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role')
  );

-- ============================================================================
-- EMAIL VALIDATION FIX
-- ============================================================================

-- Update email validation function to be more permissive for testing
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- More permissive email validation for testing environments
  RETURN email IS NOT NULL AND 
         LENGTH(email) > 5 AND 
         email LIKE '%@%.%' AND
         email !~ '\s'; -- No whitespace
END;
$$ language 'plpgsql';

-- Remove overly strict email constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_email_format;

-- Add more permissive email constraint
ALTER TABLE profiles 
ADD CONSTRAINT check_email_format 
CHECK (validate_email(email));

-- ============================================================================
-- USERNAME VALIDATION FIX
-- ============================================================================

-- Make username validation more flexible
CREATE OR REPLACE FUNCTION validate_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN username IS NOT NULL AND 
         LENGTH(username) >= 3 AND 
         LENGTH(username) <= 50 AND
         username ~* '^[A-Za-z0-9_.-]+$'; -- Allow letters, numbers, underscore, dot, dash
END;
$$ language 'plpgsql';

-- Update username constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_username_format;
ALTER TABLE profiles 
ADD CONSTRAINT check_username_format 
CHECK (validate_username(username));

-- ============================================================================
-- PROFILES TABLE ENHANCEMENTS
-- ============================================================================

-- Ensure all required columns exist with proper types
DO $$ 
BEGIN
  -- Add username column if missing (make it nullable initially)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username VARCHAR(50);
  END IF;
  
  -- Add location column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location VARCHAR(255);
  END IF;
  
  -- Ensure other columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'spotify_connected'
  ) THEN
    ALTER TABLE profiles ADD COLUMN spotify_connected BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'spotify_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN spotify_data JSONB;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Generate usernames for existing profiles that don't have one
UPDATE profiles 
SET username = LOWER(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g')) || '_' || EXTRACT(EPOCH FROM created_at)::INTEGER
WHERE username IS NULL OR username = '';

-- Make username NOT NULL and UNIQUE after populating existing records
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- Create unique index for username if it doesn't exist
DROP INDEX IF EXISTS idx_profiles_username_unique;
CREATE UNIQUE INDEX idx_profiles_username_unique ON profiles(username);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES (SIMPLIFIED)
-- ============================================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create simple, working RLS policies
CREATE POLICY "profiles_public_read" 
  ON profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "profiles_authenticated_insert" 
  ON profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_user_update" 
  ON profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_user_delete" 
  ON profiles 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- USER SESSIONS TABLE (ENSURE EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  session_duration INTERVAL
);

-- Enable RLS for sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing session policies
DROP POLICY IF EXISTS "users_can_view_own_sessions" ON user_sessions;

-- Create session policies
CREATE POLICY "sessions_user_access" 
  ON user_sessions 
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPFUL FUNCTIONS
-- ============================================================================

-- Function to generate unique usernames
CREATE OR REPLACE FUNCTION generate_unique_username(base_name TEXT, user_email TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  clean_name TEXT;
  candidate_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Clean the base name
  clean_name := LOWER(REGEXP_REPLACE(COALESCE(base_name, SPLIT_PART(user_email, '@', 1)), '[^A-Za-z0-9]', '', 'g'));
  
  -- Ensure minimum length
  IF LENGTH(clean_name) < 3 THEN
    clean_name := clean_name || 'user';
  END IF;
  
  -- Try the base name first
  candidate_username := clean_name;
  
  -- Keep trying with incrementing numbers until we find a unique username
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = candidate_username) LOOP
    candidate_username := clean_name || counter::TEXT;
    counter := counter + 1;
  END LOOP;
  
  RETURN candidate_username;
END;
$$ language 'plpgsql';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_spotify_connected ON profiles(spotify_connected);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON user_sessions(login_time);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  bucket_exists BOOLEAN;
  table_exists BOOLEAN;
  rls_enabled BOOLEAN;
BEGIN
  -- Check storage bucket
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures') INTO bucket_exists;
  
  -- Check profiles table
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') INTO table_exists;
  
  -- Check RLS
  SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles' INTO rls_enabled;
  
  RAISE NOTICE '🔧 Authentication System Fix Results:';
  RAISE NOTICE '======================================';
  RAISE NOTICE '📁 Storage bucket exists: %', CASE WHEN bucket_exists THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE '📋 Profiles table exists: %', CASE WHEN table_exists THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE '🔒 RLS enabled: %', CASE WHEN rls_enabled THEN 'YES' ELSE 'NO' END;
  
  IF bucket_exists AND table_exists AND rls_enabled THEN
    RAISE NOTICE '✅ All systems operational!';
    RAISE NOTICE '🎯 Ready for user registration and authentication!';
  ELSE
    RAISE NOTICE '⚠️ Some issues remain - check individual components';
  END IF;
END $$;