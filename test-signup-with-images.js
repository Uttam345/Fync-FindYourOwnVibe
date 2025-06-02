// Test script to verify complete signup flow with image upload
// Run this after executing the complete-database-setup.sql in Supabase
// Usage: node test-signup-with-images.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://ogspltrjsqigbikwzmgr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc3BsdHJqc3FpZ2Jpa3d6bWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwOTQzMTUsImV4cCI6MjA0NzY3MDMxNX0.CXKJ_6lqLGiTZkkqEKMGpqLxfn0H_uJ3jqEgGxrNa0I';

const supabase = createClient(supabaseUrl, supabaseKey);

// Create a test image file (1x1 pixel PNG)
const createTestImage = () => {
  // Minimal PNG file as base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return Buffer.from(pngBase64, 'base64');
};

async function testCompleteSignupFlow() {
  console.log('🧪 Testing complete signup flow with image upload...\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'test1234';
  const testUser = {
    name: 'Test User',
    email: testEmail,
    password: testPassword,
    bio: 'This is a test user created to verify the signup flow',
    favoriteGenres: ['Rock', 'Pop', 'Jazz'],
    favoriteArtists: ['Test Artist 1', 'Test Artist 2'],
    spotifyConnected: false,
    spotifyData: null
  };

  try {
    // Step 1: Test user creation
    console.log('📝 Step 1: Creating user account...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testUser.name,
          bio: testUser.bio,
          favorite_genres: testUser.favoriteGenres,
          favorite_artists: testUser.favoriteArtists
        }
      }
    });

    if (authError) {
      throw new Error(`Auth signup failed: ${authError.message}`);
    }

    console.log('✅ User created successfully:', authData.user.id);

    // Step 2: Test image upload
    console.log('\n📸 Step 2: Testing image upload...');
    const testImageBuffer = createTestImage();
    const fileName = `${authData.user.id}/profile.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, testImageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    console.log('✅ Image uploaded successfully:', uploadData.path);

    // Step 3: Get public URL
    console.log('\n🔗 Step 3: Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Step 4: Create profile with image URL
    console.log('\n👤 Step 4: Creating user profile...');
    const profileData = {
      id: authData.user.id,
      email: testUser.email,
      name: testUser.name,
      bio: testUser.bio,
      favorite_genres: testUser.favoriteGenres,
      favorite_artists: testUser.favoriteArtists,
      profile_image: urlData.publicUrl,
      spotify_connected: testUser.spotifyConnected,
      spotify_data: testUser.spotifyData
    };

    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log('✅ Profile created successfully:', profileResult.id);

    // Step 5: Verify we can retrieve the profile
    console.log('\n🔍 Step 5: Verifying profile retrieval...');
    const { data: retrievedProfile, error: retrieveError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (retrieveError) {
      throw new Error(`Profile retrieval failed: ${retrieveError.message}`);
    }

    console.log('✅ Profile retrieved successfully');
    console.log('   - Name:', retrievedProfile.name);
    console.log('   - Email:', retrievedProfile.email);
    console.log('   - Bio:', retrievedProfile.bio);
    console.log('   - Genres:', retrievedProfile.favorite_genres);
    console.log('   - Image URL:', retrievedProfile.profile_image);

    // Step 6: Test image access
    console.log('\n🌐 Step 6: Testing image access...');
    try {
      const response = await fetch(retrievedProfile.profile_image);
      if (response.ok) {
        console.log('✅ Image is publicly accessible');
        console.log('   - Status:', response.status);
        console.log('   - Content-Type:', response.headers.get('content-type'));
      } else {
        console.log('❌ Image not accessible:', response.status);
      }
    } catch (fetchError) {
      console.log('❌ Image fetch failed:', fetchError.message);
    }

    // Cleanup: Delete the test user and image
    console.log('\n🧹 Cleanup: Removing test data...');
    
    // Delete profile
    await supabase.from('profiles').delete().eq('id', authData.user.id);
    
    // Delete image
    await supabase.storage.from('profile-pictures').remove([fileName]);
    
    console.log('✅ Cleanup completed');

    console.log('\n🎉 ALL TESTS PASSED! The signup flow with image upload is working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\n💡 This usually means:');
    console.error('   1. RLS policies are not set up correctly');
    console.error('   2. Storage bucket or policies are missing');
    console.error('   3. Database table structure is incorrect');
    console.error('\n🔧 Please run the complete-database-setup.sql script in your Supabase dashboard');
    process.exit(1);
  }
}

// Run the test
testCompleteSignupFlow();
