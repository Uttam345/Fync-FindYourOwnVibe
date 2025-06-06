/*
  # Fix RLS Policies for Profiles Table

  1. New Tables
    - Ensure `profiles` table exists with all required columns
    - Update column types for image URLs
  
  2. Security
    - Enable RLS on `profiles` table
    - Create comprehensive policies for CRUD operations
    - Ensure proper authentication checks
  
  3. Storage
    - Set up profile-pictures bucket with correct policies
    - Allow authenticated users to manage their own images
*/

-- ============================================================================
-- PROFILES TABLE SETUP
-- ============================================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  bio TEXT,
  profile_image VARCHAR(500),
  cover_image VARCHAR(500),
  favorite_genres TEXT[],
  favorite_artists TEXT[],
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add spotify_connected column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'spotify_connected'
  ) THEN
    ALTER TABLE profiles ADD COLUMN spotify_connected BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add spotify_data column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'spotify_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN spotify_data JSONB;
  END IF;
  
  -- Add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Update profile_image column type if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_image' 
    AND character_maximum_length != 500
  ) THEN
    ALTER TABLE profiles ALTER COLUMN profile_image TYPE VARCHAR(500);
  END IF;
  
  -- Update cover_image column type if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cover_image' 
    AND character_maximum_length != 500
  ) THEN
    ALTER TABLE profiles ALTER COLUMN cover_image TYPE VARCHAR(500);
  END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY SETUP
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
  ON profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for profile pictures
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

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload their own profile pictures" 
  ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view profile pictures" 
  ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures" 
  ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile pictures" 
  ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_spotify ON profiles(spotify_connected);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ Profiles table RLS policies fixed!';
  RAISE NOTICE '📋 Table exists: %', (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN 'YES' ELSE 'NO' END);
  RAISE NOTICE '🔒 RLS enabled: %', (SELECT CASE WHEN rowsecurity FROM pg_tables WHERE tablename = 'profiles' THEN 'YES' ELSE 'NO' END);
  RAISE NOTICE '📁 Storage bucket: %', (SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures') THEN 'EXISTS' ELSE 'MISSING' END);
  RAISE NOTICE '🎯 Ready for user registration!';
END $$;