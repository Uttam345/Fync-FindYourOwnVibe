// Test Supabase Authentication and Database Connection
import { supabase } from './src/lib/supabase.js';

console.log('🔍 Testing Supabase Connection...');

// Test 1: Check if Supabase client is configured correctly
console.log('📍 Supabase URL:', supabase.supabaseUrl);
console.log('📍 Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...');

// Test 2: Test database connection by checking profiles table
async function testDatabaseConnection() {
  try {
    console.log('\n📋 Testing database connection...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error.message);
      console.error('Error details:', error);
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('\n💡 The profiles table does not exist in your Supabase database.');
        console.log('Please run the database-setup.sql script in your Supabase SQL editor.');
      }
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ Profiles table exists');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Test 3: Test authentication system
async function testAuth() {
  try {
    console.log('\n🔐 Testing authentication system...');
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth system error:', error.message);
      return false;
    }
    
    console.log('✅ Auth system is working');
    console.log('Current user:', data.user ? data.user.email : 'No user logged in');
    return true;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}

// Test 4: Test sign up with a dummy user
async function testSignUp() {
  try {
    console.log('\n✏️ Testing sign up functionality...');
    
    const testEmail = 'test-' + Date.now() + '@example.com';
    const testPassword = 'TestPassword123!';
    
    console.log('Attempting to sign up with:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
          bio: 'Test bio'
        }
      }
    });
    
    if (error) {
      console.error('❌ Sign up error:', error.message);
      console.error('Error details:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 This might be because email confirmation is required.');
      }
      
      return false;
    }
    
    console.log('✅ Sign up successful');
    console.log('User ID:', data.user?.id);
    console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    
    // Test profile creation
    if (data.user) {
      console.log('\n📝 Testing profile creation...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: 'Test User',
            bio: 'Test bio',
            favorite_genres: ['Rock', 'Pop'],
            favorite_artists: ['Test Artist']
          }
        ])
        .select()
        .single();
      
      if (profileError) {
        console.error('❌ Profile creation error:', profileError.message);
        console.error('Profile error details:', profileError);
        return false;
      }
      
      console.log('✅ Profile created successfully');
      console.log('Profile data:', profileData);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Sign up test failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Supabase Authentication Tests\n');
  
  const dbTest = await testDatabaseConnection();
  const authTest = await testAuth();
  
  if (dbTest && authTest) {
    await testSignUp();
  }
  
  console.log('\n🏁 Tests completed');
}

runTests().catch(console.error);
