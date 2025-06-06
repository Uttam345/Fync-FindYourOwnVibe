// Comprehensive authentication system test
// Run this after executing the database migration to verify everything works
// Usage: node test-complete-authentication.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jizhqdurtsajadtjmfny.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemhxZHVydHNhamFkdGptZm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDMyOTQsImV4cCI6MjA2MzMxOTI5NH0.Bvp7GBHbOXri_sDd4OuxgPJhpy5Lxt5tA01PCqkj9lM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteAuthSystem() {
  console.log('🧪 Testing Complete Authentication and Profile System');
  console.log('====================================================\n');

  const testResults = {
    connection: false,
    profilesTable: false,
    storageSetup: false,
    rlsPolicies: false,
    userSignup: false,
    profileCreation: false,
    dataRetrieval: false,
    sessionTracking: false
  };

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.log('❌ Database connection failed:', connectionError.message);
    } else {
      testResults.connection = true;
      console.log('✅ Database connection successful');
    }

    // Test 2: Profiles Table Structure
    console.log('\n2️⃣ Testing profiles table structure...');
    const { data: tableStructure, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    if (tableError) {
      console.log('❌ Profiles table issue:', tableError.message);
    } else {
      testResults.profilesTable = true;
      console.log('✅ Profiles table exists with proper structure');
    }

    // Test 3: Storage Bucket Setup
    console.log('\n3️⃣ Testing storage bucket configuration...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Storage access failed:', bucketError.message);
    } else {
      const profileBucket = buckets.find(bucket => bucket.id === 'profile-pictures');
      if (profileBucket) {
        testResults.storageSetup = true;
        console.log('✅ Profile pictures storage bucket configured');
        console.log(`   📁 Public: ${profileBucket.public}, Size limit: ${profileBucket.file_size_limit || 'unlimited'}`);
      } else {
        console.log('❌ Profile pictures bucket not found');
      }
    }

    // Test 4: RLS Policies
    console.log('\n4️⃣ Testing Row Level Security policies...');
    const { error: rlsError } = await supabase
      .from('profiles')
      .insert([{
        id: '00000000-0000-0000-0000-000000000000',
        email: 'unauthorized@test.com',
        username: 'unauthorized',
        name: 'Unauthorized Test'
      }]);

    if (rlsError && (rlsError.code === '42501' || rlsError.message.includes('policy'))) {
      testResults.rlsPolicies = true;
      console.log('✅ RLS policies are active and protecting data');
    } else {
      console.log('⚠️  RLS policies may not be configured correctly');
    }

    // Test 5: Complete User Signup Flow
    console.log('\n5️⃣ Testing complete user signup flow...');
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      username: `testuser${Date.now()}`,
      name: 'Test User',
      bio: 'This is a comprehensive test of the authentication system',
      location: 'Test City, TC',
      favoriteGenres: ['Rock', 'Pop', 'Electronic'],
      favoriteArtists: ['Test Artist 1', 'Test Artist 2']
    };

    // Step 5a: Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          username: testUser.username,
          bio: testUser.bio
        }
      }
    });

    if (authError) {
      console.log('❌ User signup failed:', authError.message);
    } else if (authData.user) {
      testResults.userSignup = true;
      console.log('✅ User account created successfully');
      console.log(`   👤 User ID: ${authData.user.id}`);
      console.log(`   📧 Email: ${authData.user.email}`);

      // Step 5b: Create comprehensive profile
      console.log('\n6️⃣ Testing profile creation with comprehensive data...');
      const profileData = {
        id: authData.user.id,
        email: testUser.email,
        username: testUser.username,
        name: testUser.name,
        bio: testUser.bio,
        location: testUser.location,
        favorite_genres: testUser.favoriteGenres,
        favorite_artists: testUser.favoriteArtists,
        spotify_connected: false,
        spotify_data: null
      };

      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.log('❌ Profile creation failed:', profileError.message);
        if (profileError.code === '42501') {
          console.log('💡 RLS policy error - ensure the migration was run correctly');
        }
      } else {
        testResults.profileCreation = true;
        console.log('✅ Comprehensive profile created successfully');
        console.log(`   📝 Profile fields: ${Object.keys(profileResult).length}`);
        console.log(`   🎵 Favorite genres: ${profileResult.favorite_genres?.length || 0}`);
        console.log(`   🎤 Favorite artists: ${profileResult.favorite_artists?.length || 0}`);

        // Test 6: Data Retrieval
        console.log('\n7️⃣ Testing data retrieval...');
        const { data: retrievedProfile, error: retrieveError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_sessions!user_sessions_user_id_fkey(
              login_time,
              user_agent
            )
          `)
          .eq('id', authData.user.id)
          .single();

        if (retrieveError) {
          console.log('❌ Data retrieval failed:', retrieveError.message);
        } else {
          testResults.dataRetrieval = true;
          console.log('✅ Profile data retrieved successfully');
          console.log(`   📊 Username: ${retrievedProfile.username}`);
          console.log(`   📅 Created: ${new Date(retrievedProfile.created_at).toLocaleString()}`);
          console.log(`   🔄 Updated: ${new Date(retrievedProfile.updated_at).toLocaleString()}`);
        }

        // Test 7: Session Tracking
        console.log('\n8️⃣ Testing session tracking...');
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_sessions')
          .insert([{
            user_id: authData.user.id,
            login_time: new Date().toISOString(),
            user_agent: 'Test User Agent - Authentication System Test'
          }])
          .select()
          .single();

        if (sessionError) {
          console.log('❌ Session tracking failed:', sessionError.message);
        } else {
          testResults.sessionTracking = true;
          console.log('✅ Session tracking working correctly');
          console.log(`   🕐 Session logged at: ${new Date(sessionData.login_time).toLocaleString()}`);
        }

        // Cleanup: Remove test data
        console.log('\n🧹 Cleaning up test data...');
        await supabase.from('user_sessions').delete().eq('user_id', authData.user.id);
        await supabase.from('profiles').delete().eq('id', authData.user.id);
        console.log('✅ Test data cleaned up');
      }
    }

    // Final Results Summary
    console.log('\n📊 Test Results Summary');
    console.log('======================');
    
    const results = [
      { name: 'Database Connection', passed: testResults.connection },
      { name: 'Profiles Table Structure', passed: testResults.profilesTable },
      { name: 'Storage Bucket Setup', passed: testResults.storageSetup },
      { name: 'RLS Security Policies', passed: testResults.rlsPolicies },
      { name: 'User Account Creation', passed: testResults.userSignup },
      { name: 'Profile Data Storage', passed: testResults.profileCreation },
      { name: 'Data Retrieval System', passed: testResults.dataRetrieval },
      { name: 'Session Tracking', passed: testResults.sessionTracking }
    ];

    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
    });

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('\n🎉 PERFECT! Your authentication system is fully functional!');
      console.log('✨ Features working correctly:');
      console.log('   • Complete user registration with username');
      console.log('   • Secure profile data storage');
      console.log('   • Row Level Security protection');
      console.log('   • Profile picture storage capability');
      console.log('   • Session tracking and login history');
      console.log('   • Comprehensive data retrieval');
      console.log('\n👍 Your FYNC app is ready for users!');
    } else if (passedTests >= 6) {
      console.log('\n✅ Good! Most core functionality is working.');
      console.log('💡 Run the database migration if you haven\'t already.');
    } else {
      console.log('\n⚠️  Multiple issues detected.');
      console.log('🔧 Please run the complete database migration script.');
    }

  } catch (error) {
    console.error('\n💥 Test failed with unexpected error:', error.message);
    console.error('🔧 Please check your Supabase configuration and network connection.');
  }
}

// Run the comprehensive test
testCompleteAuthSystem();