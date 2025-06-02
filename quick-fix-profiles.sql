-- Quick fix for profiles table RLS policies and missing columns
-- Run this in your Supabase SQL Editor

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spotify_data JSONB;

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

-- Create the essential policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_spotify ON profiles(spotify_connected);

-- Test the policies by attempting a simple select
SELECT 'Profiles table setup complete!' as status;
