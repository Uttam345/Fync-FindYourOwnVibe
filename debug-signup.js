// Test script to debug signup functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jizhqdurtsajadtjmfny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemhxZHVydHNhamFkdGptZm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDMyOTQsImV4cCI6MjA2MzMxOTI5NH0.Bvp7GBHbOXri_sDd4OuxgPJhpy5Lxt5tA01PCqkj9lM';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  try {
    console.log('\n=== Testing Supabase Connection ===');
    
    // Test connection
    const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1);
    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }
    console.log('✓ Supabase connection successful');    // Test signup
    console.log('\n=== Testing Signup ===');
    const testEmail = `test.user.${Date.now()}@gmail.com`;
    const testPassword = 'testpass123';
    
    console.log(`Attempting signup with email: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('Signup failed:', authError);
      return;
    }

    console.log('✓ Signup successful:', authData);
    
    // Check if user was created
    if (authData.user) {
      console.log('User ID:', authData.user.id);
      console.log('User Email:', authData.user.email);
      console.log('Email Confirmed:', authData.user.email_confirmed_at);
      
      // Try to create profile
      console.log('\n=== Testing Profile Creation ===');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: 'Test User',
          bio: 'Test bio',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation failed:', profileError);
      } else {
        console.log('✓ Profile created successfully:', profileData);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSignup();
