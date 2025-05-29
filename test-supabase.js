// Test script to verify Supabase connection and database setup
import { supabase } from './src/lib/supabase.js';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) {
      console.log('Database connection test result:', error.message);
      
      // If profiles table doesn't exist, that's expected for a fresh setup
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('✅ Supabase connection successful, but tables need to be created');
        console.log('Please create the following tables in your Supabase dashboard:');
        console.log(`
1. profiles table:
   - id (uuid, primary key, references auth.users)
   - email (text, unique)
   - name (text)
   - bio (text)
   - profile_image (text)
   - cover_image (text)
   - favorite_genres (text[])
   - created_at (timestamp with time zone)

2. events table:
   - id (uuid, primary key)
   - title (text)
   - description (text)
   - date (timestamp with time zone)
   - time (text)
   - location (text)
   - creator_id (uuid, references profiles.id)
   - attendees_count (integer)
   - max_attendees (integer)
   - genre (text)
   - image (text)
   - created_at (timestamp with time zone)

3. connections table:
   - id (uuid, primary key)
   - user1_id (uuid, references profiles.id)
   - user2_id (uuid, references profiles.id)
   - status (text) -- 'pending', 'accepted', 'rejected'
   - created_at (timestamp with time zone)

4. chats table:
   - id (uuid, primary key)
   - connection_id (uuid, references connections.id)
   - sender_id (uuid, references profiles.id)
   - message (text)
   - created_at (timestamp with time zone)

5. memories table:
   - id (uuid, primary key)
   - user_id (uuid, references profiles.id)
   - event_id (uuid, references events.id)
   - title (text)
   - description (text)
   - photos (text[])
   - created_at (timestamp with time zone)
        `);
      } else {
        console.error('❌ Supabase connection failed:', error.message);
      }
    } else {
      console.log('✅ Supabase connection and database setup successful!');
      console.log('Profile count:', data);
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

// Test authentication
async function testAuth() {
  console.log('\nTesting authentication...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ User is logged in:', user.email);
    } else {
      console.log('ℹ️ No user currently logged in');
    }
  } catch (err) {
    console.error('❌ Auth test failed:', err.message);
  }
}

// Run tests
testSupabaseConnection();
testAuth();
