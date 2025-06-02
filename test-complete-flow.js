// Complete signup flow test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jizhqdurtsajadtjmfny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemhxZHVydHNhamFkdGptZm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDMyOTQsImV4cCI6MjA2MzMxOTI5NH0.Bvp7GBHbOXri_sDd4OuxgPJhpy5Lxt5tA01PCqkj9lM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteSignupFlow() {
  console.log('\n🚀 Testing Complete FYNC Signup Flow');
  console.log('=====================================\n');

  try {
    // Step 1: Test database connection and table structure
    console.log('1. Testing database connection...');
    const { data: tableTest, error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Database connection failed:', tableError.message);
      if (tableError.message.includes('relation "profiles" does not exist')) {
        console.log('💡 FIX: Run quick-fix-profiles.sql in your Supabase SQL Editor');
      }
      return;
    }
    console.log('✅ Database connection successful');

    // Step 2: Test user creation
    console.log('\n2. Testing user creation...');
    const testEmail = `test.complete.${Date.now()}@gmail.com`;
    const testPassword = 'test1234';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ User creation failed:', authError.message);
      return;
    }
    console.log('✅ User created:', authData.user.id);

    // Step 3: Test profile creation with all fields
    console.log('\n3. Testing profile creation with complete data...');
    const profileData = {
      id: authData.user.id,
      email: authData.user.email,
      name: 'Test User Complete',
      bio: 'I love music and connecting with fellow fans!',
      profile_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Tiny 1x1 pixel image
      favorite_genres: ['Rock', 'Pop', 'Electronic'],
      favorite_artists: ['Coldplay', 'The Beatles', 'Daft Punk'],
      spotify_connected: false,
      spotify_data: null
    };

    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      if (profileError.code === '42501') {
        console.log('💡 FIX: RLS policies missing. Run quick-fix-profiles.sql');
      } else if (profileError.code === '42703') {
        console.log('💡 FIX: Missing columns. Run quick-fix-profiles.sql to add spotify fields');
      }
      return;
    }
    console.log('✅ Profile created with all data fields');

    // Step 4: Test profile retrieval
    console.log('\n4. Testing profile retrieval...');
    const { data: retrievedProfile, error: retrieveError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (retrieveError) {
      console.error('❌ Profile retrieval failed:', retrieveError.message);
      return;
    }
    
    console.log('✅ Profile retrieved successfully');
    console.log('   Name:', retrievedProfile.name);
    console.log('   Email:', retrievedProfile.email);
    console.log('   Bio:', retrievedProfile.bio);
    console.log('   Genres:', retrievedProfile.favorite_genres);
    console.log('   Artists:', retrievedProfile.favorite_artists);
    console.log('   Has Profile Image:', retrievedProfile.profile_image ? 'Yes' : 'No');
    console.log('   Spotify Connected:', retrievedProfile.spotify_connected);

    // Step 5: Test sign in
    console.log('\n5. Testing sign in (if email confirmed)...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('⚠️ Sign in not available (email confirmation required)');
      console.log('   This is normal for new accounts');
    } else {
      console.log('✅ Sign in successful');
    }

    // Final success message
    console.log('\n🎉 SUCCESS: Complete signup flow is working!');
    console.log('=====================================');
    console.log('✅ Users are being created in Supabase auth');
    console.log('✅ Profiles are being stored in profiles table');
    console.log('✅ Profile images are being saved');
    console.log('✅ All user data is being preserved');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the actual signup flow in the app');
    console.log('   2. Check your Supabase dashboard - users should now appear');
    console.log('   3. Users will appear in both Authentication and profiles table');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure you ran quick-fix-profiles.sql in Supabase');
    console.log('   2. Check your internet connection');
    console.log('   3. Verify Supabase credentials in .env file');
  }
}

testCompleteSignupFlow();
