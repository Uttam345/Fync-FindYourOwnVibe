import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase URL and Anon Key are required! Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database table schemas for FYNC
export const createTables = async () => {
  // This is just for reference - actual tables should be created in Supabase dashboard
  const schemas = {
    profiles: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users ON DELETE CASCADE,
        email VARCHAR UNIQUE NOT NULL,
        name VARCHAR NOT NULL,
        bio TEXT,
        profile_image VARCHAR,
        cover_image VARCHAR,
        location VARCHAR,
        favorite_genres TEXT[],
        favorite_artists TEXT[],
        concerts_attended INTEGER DEFAULT 0,
        memories_count INTEGER DEFAULT 0,
        friends_count INTEGER DEFAULT 0,
        spotify_connected BOOLEAN DEFAULT FALSE,
        instagram_connected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (id)
      );
    `,
    events: `
      CREATE TABLE IF NOT EXISTS events (
        id UUID DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        description TEXT,
        image VARCHAR,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        location VARCHAR NOT NULL,
        venue VARCHAR,
        price DECIMAL,
        genre VARCHAR,
        lineup TEXT[],
        attendees_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (id)
      );
    `,
    memories: `
      CREATE TABLE IF NOT EXISTS memories (
        id UUID DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        event_id UUID REFERENCES events(id) ON DELETE SET NULL,
        caption TEXT,
        image VARCHAR,
        mood VARCHAR,
        event_type VARCHAR,
        location VARCHAR,
        tagged_friends UUID[],
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (id)
      );
    `,
    connections: `
      CREATE TABLE IF NOT EXISTS connections (
        id UUID DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        status VARCHAR DEFAULT 'pending', -- pending, accepted, blocked
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (id),
        UNIQUE(user_id, friend_id)
      );
    `,
    chats: `
      CREATE TABLE IF NOT EXISTS chats (
        id UUID DEFAULT gen_random_uuid(),
        participants UUID[],
        chat_type VARCHAR DEFAULT 'direct', -- direct, group, event
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR,
        last_message TEXT,
        last_message_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (id)
      );
    `,
    messages: `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT gen_random_uuid(),
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR DEFAULT 'text', -- text, image, voice, system
        attachment VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (id)
      );
    `
  };
  
  return schemas;
};