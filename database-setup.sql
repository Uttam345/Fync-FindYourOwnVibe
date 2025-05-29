-- FYNC Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  bio TEXT,
  profile_image VARCHAR,
  cover_image VARCHAR,
  favorite_genres TEXT[],
  favorite_artists TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  time TEXT,
  location TEXT,
  venue TEXT,
  price DECIMAL(10,2),
  genre TEXT,
  lineup TEXT[],
  creator_id UUID REFERENCES profiles(id),
  attendees_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id),
  user2_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES connections(id),
  sender_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  event_id UUID REFERENCES events(id),
  title TEXT NOT NULL,
  description TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for events
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = creator_id);

-- Create policies for connections
CREATE POLICY "Users can view their connections" ON connections 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Authenticated users can create connections" ON connections 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user1_id);
CREATE POLICY "Users can update their connections" ON connections 
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create policies for chats
CREATE POLICY "Users can view chats in their connections" ON chats 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections 
      WHERE connections.id = chats.connection_id 
      AND (connections.user1_id = auth.uid() OR connections.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in their connections" ON chats 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM connections 
      WHERE connections.id = chats.connection_id 
      AND (connections.user1_id = auth.uid() OR connections.user2_id = auth.uid())
      AND connections.status = 'accepted'
    )
  );

-- Create policies for memories
CREATE POLICY "Users can view all memories" ON memories FOR SELECT USING (true);
CREATE POLICY "Users can create their own memories" ON memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memories" ON memories FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_genre ON events(genre);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_chats_connection ON chats(connection_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);
CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_event ON memories(event_id);

-- Insert some sample data (optional)
-- You can uncomment and modify these if you want some initial data

/*
-- Sample events
INSERT INTO events (title, description, date, location, venue, price, genre, lineup, attendees_count) VALUES
('Summer Music Festival 2025', 'The biggest music festival of the year featuring top artists from around the world.', '2025-07-15 18:00:00+00', 'Central Park, New York', 'Great Lawn', 125.00, 'Mixed', ARRAY['Arctic Monkeys', 'Billie Eilish', 'The Weeknd', 'Dua Lipa'], 2500),
('Electronic Beats Night', 'An unforgettable night of electronic music and dancing.', '2025-06-20 21:00:00+00', 'Los Angeles, CA', 'The Warehouse', 75.00, 'Electronic', ARRAY['Calvin Harris', 'Deadmau5', 'Skrillex'], 800),
('Acoustic Sessions', 'Intimate acoustic performances by rising indie artists.', '2025-06-05 19:30:00+00', 'Seattle, WA', 'Blue Moon Cafe', 35.00, 'Indie', ARRAY['Phoebe Bridgers', 'Mac DeMarco', 'Boy Pablo'], 150);
*/
