-- Complete Database and Storage Setup for FYNC
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This script sets up both the profiles table with RLS policies AND the storage bucket

-- ============================================================================
-- PART 1: PROFILES TABLE SETUP
-- ============================================================================

-- First, check if profiles table exists, if not create it with all necessary columns
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  bio TEXT,
  profile_image VARCHAR(500), -- Store image URLs from Supabase Storage
  cover_image VARCHAR(500),   -- Store cover image URLs from Supabase Storage
  favorite_genres TEXT[],
  favorite_artists TEXT[],
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spotify_data JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing columns to handle URLs instead of base64
DO $$ 
BEGIN
  -- Update profile_image column type if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'profile_image') THEN
    ALTER TABLE profiles ALTER COLUMN profile_image TYPE VARCHAR(500);
  END IF;
  
  -- Update cover_image column type if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'cover_image') THEN
    ALTER TABLE profiles ALTER COLUMN cover_image TYPE VARCHAR(500);
  END IF;
END $$;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Create the essential policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_spotify ON profiles(spotify_connected);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- ============================================================================
-- PART 2: STORAGE BUCKET SETUP
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

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- PART 3: VERIFICATION AND CLEANUP
-- ============================================================================

-- Create a function to update the updated_at timestamp
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

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📋 Profiles table: %', (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN 'EXISTS' ELSE 'MISSING' END);
  RAISE NOTICE '🔒 RLS enabled: %', (SELECT CASE WHEN rowsecurity FROM pg_tables WHERE tablename = 'profiles' THEN 'YES' ELSE 'NO' END);
  RAISE NOTICE '📁 Storage bucket: %', (SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures') THEN 'CREATED' ELSE 'FAILED' END);
  RAISE NOTICE '🎯 Ready for user registration and image uploads!';
END $$;

SELECT 'FYNC Database and Storage Setup Complete!' as status,
       'You can now test the signup flow' as next_step;
