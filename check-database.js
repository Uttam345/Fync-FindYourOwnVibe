// Check database schema and policies
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jizhqdurtsajadtjmfny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemhxZHVydHNhamFkdGptZm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDMyOTQsImV4cCI6MjA2MzMxOTI5NH0.Bvp7GBHbOXri_sDd4OuxgPJhpy5Lxt5tA01PCqkj9lM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  try {
    console.log('\n=== Checking Database Schema ===');
    
    // Check if profiles table exists
    console.log('\nTesting profiles table access...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
    } else {
      console.log('✓ Profiles table exists and is accessible');
      console.log('Sample data:', profilesData);
    }

    // Check if events table exists
    console.log('\nTesting events table access...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.error('Events table error:', eventsError);
    } else {
      console.log('✓ Events table exists and is accessible');
    }

    // Check if connections table exists
    console.log('\nTesting connections table access...');
    const { data: connectionsData, error: connectionsError } = await supabase
      .from('connections')
      .select('*')
      .limit(1);
    
    if (connectionsError) {
      console.error('Connections table error:', connectionsError);
    } else {
      console.log('✓ Connections table exists and is accessible');
    }

    // Test creating a user and profile with authentication
    console.log('\n=== Testing Authenticated Profile Creation ===');
    const testEmail = `test.auth.${Date.now()}@gmail.com`;
    const testPassword = 'testpass123';
    
    console.log(`Creating authenticated user: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('Auth signup failed:', authError);
      return;
    }

    if (authData.user) {
      console.log('✓ User created successfully');
      
      // Now sign in to get a session
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (sessionError) {
        console.error('Sign in failed:', sessionError);
        // Try with unconfirmed email
        console.log('Trying profile creation without email confirmation...');
      }

      // Try to create profile (with or without session)
      console.log('Attempting profile creation...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: 'Test User',
          bio: 'Test bio',
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        
        // Check if RLS is the issue
        if (profileError.code === '42501') {
          console.log('\n❌ Row Level Security policy violation detected!');
          console.log('This means the profiles table has RLS enabled but missing policies.');
          console.log('You need to run the database-setup.sql in your Supabase SQL editor.');
        }
      } else {
        console.log('✓ Profile created successfully:', profileData);
      }
    }

  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase();
