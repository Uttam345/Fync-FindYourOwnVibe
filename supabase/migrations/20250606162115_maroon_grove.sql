/*
  # Complete User Authentication and Profile Data Storage System
  
  This migration creates a comprehensive authentication and profile system that:
  1. Captures essential user information during sign-up
  2. Implements proper data persistence with Supabase
  3. Sets up secure relationships between auth.users and profiles
  4. Ensures proper RLS policies for data security
*/

-- ============================================================================
-- PROFILES TABLE - Complete user profile storage
-- ============================================================================

-- Create profiles table with all required fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL, -- Unique username field
  name VARCHAR NOT NULL, -- Display name
  bio TEXT DEFAULT '',
  profile_image VARCHAR(500),
  cover_image VARCHAR(500),
  favorite_genres TEXT[] DEFAULT '{}',
  favorite_artists TEXT[] DEFAULT '{}',
  location VARCHAR(255),
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add username column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username VARCHAR UNIQUE;
    -- Set default usernames based on email for existing records
    UPDATE profiles SET username = SPLIT_PART(email, '@', 1) || '_' || EXTRACT(EPOCH FROM created_at)::INTEGER 
    WHERE username IS NULL;
    ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
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

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "profiles_select_policy" 
  ON profiles 
  FOR SELECT 
  USING (true); -- Anyone can view profiles

CREATE POLICY "profiles_insert_policy" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id AND 
    auth.role() = 'authenticated'
  ); -- Users can only insert their own profile when authenticated

CREATE POLICY "profiles_update_policy" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id); -- Users can only update their own profile

CREATE POLICY "profiles_delete_policy" 
  ON profiles 
  FOR DELETE 
  USING (auth.uid() = id); -- Users can only delete their own profile

-- ============================================================================
-- USER SESSIONS TABLE - Track login history
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

CREATE POLICY "users_can_view_own_sessions" 
  ON user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================================================
-- PROFILE PICTURES STORAGE BUCKET
-- ============================================================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, 
  5242880, -- 5MB limit
  '{"image/jpeg","image/jpg","image/png","image/webp","image/gif"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

CREATE POLICY "profile_pictures_insert_policy" 
  ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_pictures_select_policy" 
  ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "profile_pictures_update_policy" 
  ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_pictures_delete_policy" 
  ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user with basic information
  INSERT INTO public.profiles (id, email, username, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_spotify_connected ON profiles(spotify_connected);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON user_sessions(login_time);

-- ============================================================================
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate email format
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ language 'plpgsql';

-- Function to validate username (alphanumeric and underscores only)
CREATE OR REPLACE FUNCTION validate_username(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN username ~* '^[A-Za-z0-9_]{3,30}$';
END;
$$ language 'plpgsql';

-- Add check constraints for data validation
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS check_email_format,
ADD CONSTRAINT check_email_format CHECK (validate_email(email));

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS check_username_format,
ADD CONSTRAINT check_username_format CHECK (validate_username(username));

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

-- Create a test function to verify the setup
CREATE OR REPLACE FUNCTION test_auth_system()
RETURNS TABLE(
  test_name TEXT,
  test_result BOOLEAN,
  test_message TEXT
) AS $$
BEGIN
  -- Test 1: Check if profiles table exists
  RETURN QUERY SELECT 
    'Profiles Table Exists'::TEXT,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles'),
    'Profiles table structure is ready'::TEXT;
  
  -- Test 2: Check if RLS is enabled
  RETURN QUERY SELECT 
    'RLS Enabled'::TEXT,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles'),
    'Row Level Security is active'::TEXT;
  
  -- Test 3: Check if storage bucket exists
  RETURN QUERY SELECT 
    'Storage Bucket Exists'::TEXT,
    EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures'),
    'Profile pictures storage is ready'::TEXT;
  
  -- Test 4: Check if trigger exists
  RETURN QUERY SELECT 
    'Auto Profile Creation Trigger'::TEXT,
    EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created'),
    'Automatic profile creation is enabled'::TEXT;
END;
$$ language 'plpgsql';

-- ============================================================================
-- INITIAL SETUP VERIFICATION
-- ============================================================================

DO $$
DECLARE
  test_record RECORD;
BEGIN
  RAISE NOTICE '🚀 FYNC Authentication System Setup Complete!';
  RAISE NOTICE '================================================';
  
  -- Run tests and display results
  FOR test_record IN SELECT * FROM test_auth_system() LOOP
    IF test_record.test_result THEN
      RAISE NOTICE '✅ %: %', test_record.test_name, test_record.test_message;
    ELSE
      RAISE NOTICE '❌ %: Failed', test_record.test_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 System Features:';
  RAISE NOTICE '   • User authentication with Supabase Auth';
  RAISE NOTICE '   • Comprehensive user profiles with username';
  RAISE NOTICE '   • Secure file upload for profile pictures';
  RAISE NOTICE '   • Automatic profile creation on signup';
  RAISE NOTICE '   • Session tracking and login history';
  RAISE NOTICE '   • Data validation and security policies';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for user registration and authentication!';
END $$;