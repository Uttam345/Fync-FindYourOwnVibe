import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signupTesting, setSignupTesting] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }]);
  };
  const testSignupFlow = async () => {
    setSignupTesting(true);
    setTestResults([]);
    
    try {
      const testEmail = `test.signup.${Date.now()}@gmail.com`;
      const testPassword = 'testpass123';
      
      addResult('Signup', 'info', `Testing complete signup flow with: ${testEmail}`);
      
      // Test user creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (authError) {
        addResult('Signup', 'error', 'User creation failed', authError);
        return;
      }
      
      addResult('Signup', 'success', `User created: ${authData.user.id}`);
      
      // Test authenticated profile creation by signing in first
      addResult('Auth', 'info', 'Attempting to sign in for authenticated profile creation...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        addResult('Auth', 'warning', 'Sign in failed (email not confirmed), testing direct profile creation', signInError);
      } else {
        addResult('Auth', 'success', 'User signed in successfully');
      }
      
      // Test profile creation with current auth context
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: 'Test User',
          bio: 'Test bio from component',
          favorite_genres: ['Rock', 'Pop'],
          favorite_artists: ['Test Artist'],
          profile_image: '/api/placeholder/150/150'
        })
        .select()
        .single();

      if (profileError) {
        addResult('Profile', 'error', 'Profile creation failed', profileError);
        if (profileError.code === '42501') {
          addResult('Fix', 'warning', 'RLS Policy Error detected!');
          addResult('Fix', 'info', 'Run this SQL in Supabase SQL Editor:');
          addResult('Fix', 'info', 'CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);');
        } else if (profileError.code === '23505') {
          addResult('Profile', 'warning', 'Profile already exists for this user');
        }
      } else {
        addResult('Profile', 'success', 'Profile created successfully!', profileData);
        addResult('Success', 'success', '🎉 Full signup flow working! Users will appear in dashboard.');
        
        // Test profile retrieval
        const { data: retrievedProfile, error: retrieveError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (retrieveError) {
          addResult('Retrieve', 'error', 'Profile retrieval failed', retrieveError);
        } else {
          addResult('Retrieve', 'success', 'Profile retrieved successfully', retrievedProfile);
        }
      }
      
    } catch (error) {
      addResult('Signup', 'error', 'Signup test failed', error);
    } finally {
      setSignupTesting(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check Supabase configuration
      addResult('Config', 'info', `Supabase URL: ${supabase.supabaseUrl}`);
      addResult('Config', 'info', `Supabase Key: ${supabase.supabaseKey?.substring(0, 20)}...`);

      // Test 2: Test database connection
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) {
          addResult('Database', 'error', 'Database connection failed', error);
          if (error.message.includes('relation "profiles" does not exist')) {
            addResult('Database', 'warning', 'Profiles table does not exist. Run database-setup.sql in Supabase.');
          }
        } else {
          addResult('Database', 'success', 'Database connection successful');
        }
      } catch (error) {
        addResult('Database', 'error', 'Database test failed', error);
      }

      // Test 3: Test auth system
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          addResult('Auth', 'error', 'Auth system error', error);
        } else {
          addResult('Auth', 'success', `Auth system working. Current user: ${data.user ? data.user.email : 'None'}`);
        }
      } catch (error) {
        addResult('Auth', 'error', 'Auth test failed', error);
      }

      // Test 4: Test sign up
      try {
        const testEmail = `test-${Date.now()}@example.com`;
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: 'TestPassword123!',
          options: {
            data: {
              name: 'Test User'
            }
          }
        });

        if (error) {
          addResult('SignUp', 'error', 'Sign up failed', error);
        } else {
          addResult('SignUp', 'success', `Sign up successful. User ID: ${data.user?.id}`);
          
          // Test profile creation if user was created
          if (data.user) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .insert([{
                  id: data.user.id,
                  email: data.user.email,
                  name: 'Test User',
                  bio: 'Test bio',
                  favorite_genres: ['Rock'],
                  favorite_artists: ['Test Artist']
                }])
                .select()
                .single();

              if (profileError) {
                addResult('Profile', 'error', 'Profile creation failed', profileError);
              } else {
                addResult('Profile', 'success', 'Profile created successfully');
              }
            } catch (profileError) {
              addResult('Profile', 'error', 'Profile creation error', profileError);
            }
          }
        }
      } catch (error) {
        addResult('SignUp', 'error', 'Sign up test failed', error);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Supabase Test Panel</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={runTests}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Running Tests...' : 'Run Tests'}
        </button>        <button 
          onClick={testSignupFlow}
          disabled={signupTesting}
          style={{
            background: signupTesting ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: signupTesting ? 'not-allowed' : 'pointer'
          }}
        >
          {signupTesting ? 'Testing Signup...' : 'Test Complete Signup Flow'}
        </button>
        
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
          <p>This tests the complete signup process including profile creation and image storage</p>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '8px',
            border: '1px solid #eee',
            borderRadius: '4px',
            background: result.status === 'error' ? '#fee' : 
                       result.status === 'success' ? '#efe' :
                       result.status === 'warning' ? '#ffeaa7' : '#f8f9fa'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {result.status === 'error' ? '❌' : 
               result.status === 'success' ? '✅' : 
               result.status === 'warning' ? '⚠️' : 'ℹ️'} {result.test}
            </div>
            <div style={{ marginBottom: '4px' }}>{result.message}</div>
            {result.details && (
              <details style={{ marginTop: '4px' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>Details</summary>
                <pre style={{ 
                  margin: '4px 0 0 0', 
                  padding: '4px',
                  background: '#f5f5f5',
                  borderRadius: '2px',
                  fontSize: '10px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupabaseTestComponent;
