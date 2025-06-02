// Test signup after fixing RLS policies
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jizhqdurtsajadtjmfny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemhxZHVydHNhamFkdGptZm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDMyOTQsImV4cCI6MjA2MzMxOTI5NH0.Bvp7GBHbOXri_sDd4OuxgPJhpy5Lxt5tA01PCqkj9lM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFixedSignup() {
  try {
    console.log('\n=== Testing Fixed Signup Process ===');
    
    const testEmail = `test.fixed.${Date.now()}@gmail.com`;
    const testPassword = 'testpass123';
    
    console.log(`\n1. Creating user account: ${testEmail}`);
    
    // Step 1: Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ User creation failed:', authError);
      return;
    }
    
    console.log('✅ User account created successfully');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // Step 2: Create profile (this should work now with proper RLS policies)
    console.log('\n2. Creating user profile...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: 'Test User',
        bio: 'This is a test user created after fixing RLS policies',
        favorite_genres: ['Rock', 'Pop'],
        favorite_artists: ['Test Artist 1', 'Test Artist 2']
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      
      if (profileError.code === '42501') {
        console.log('\n💡 Still getting RLS error. Make sure you ran the SQL fix!');
        console.log('   Run quick-fix-profiles.sql in your Supabase SQL Editor');
      }
      return;
    }
    
    console.log('✅ Profile created successfully!');
    console.log('   Profile:', profileData);
    
    // Step 3: Test retrieving the profile
    console.log('\n3. Retrieving user profile...');
    
    const { data: retrievedProfile, error: retrieveError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (retrieveError) {
      console.error('❌ Profile retrieval failed:', retrieveError);
    } else {
      console.log('✅ Profile retrieved successfully!');
      console.log('   Retrieved profile:', retrievedProfile);
    }
    
    console.log('\n🎉 SUCCESS: Full signup flow is now working!');
    console.log('   Users should now appear in your Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixedSignup();
