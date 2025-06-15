import { supabase } from '../lib/supabase'
import { ImageUploadService } from './imageUploadService'

export class AuthService {  
  // Enhanced system setup check with more thorough verification
  static async checkSystemSetup() {
    try {
      console.log('🔍 Checking system setup...');
      
      // First, test basic Supabase connection
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('✅ Supabase connection established');
      } catch (connectionError) {
        console.error('❌ Supabase connection failed:', connectionError);
        return {
          isSetup: false,
          error: 'CONNECTION_ERROR',
          message: 'Unable to connect to Supabase. Please check your configuration and internet connection.'
        };
      }
      
      // Test if profiles table exists and is accessible
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (profilesError) {
        console.error('❌ Database setup issue:', profilesError);
        if (profilesError.code === '42P01') {
          return { 
            isSetup: false, 
            error: 'DATABASE_NOT_SETUP',
            message: 'The profiles table does not exist. Please run the complete-database-setup.sql script in your Supabase SQL Editor to set up the database.' 
          };
        }
        if (profilesError.code === '42501') {
          return { 
            isSetup: false, 
            error: 'RLS_NOT_CONFIGURED',
            message: 'Database Row Level Security policies are not configured. Please run the complete-database-setup.sql script in your Supabase SQL Editor.' 
          };
        }
        return { 
          isSetup: false, 
          error: 'DATABASE_ERROR',
          message: `Database configuration error (${profilesError.code}): ${profilesError.message}. Please run the complete database setup script.` 
        };
      }
      
      // Test storage bucket exists
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error('❌ Storage service error:', bucketError);
          return {
            isSetup: false,
            error: 'STORAGE_ERROR',
            message: 'Storage service is not accessible. Please run the complete database setup script to configure storage buckets.'
          };
        }
        
        const hasBucket = buckets?.find(b => b.id === 'profile-pictures');
        if (!hasBucket) {
          console.warn('⚠️ Profile pictures bucket missing');
          return {
            isSetup: false,
            error: 'STORAGE_BUCKET_MISSING',
            message: 'The profile-pictures storage bucket is missing. Please run the complete-database-setup.sql script to create storage buckets.'
          };
        }
      } catch (storageError) {
        console.error('❌ Storage check failed:', storageError);
        return {
          isSetup: false,
          error: 'STORAGE_CHECK_FAILED',
          message: 'Unable to verify storage configuration. Please run the complete database setup script.'
        };
      }
      
      // Test if we can query profiles table (RLS policies working)
      try {
        const { data: testProfiles, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (testError && testError.code === '42501') {
          return {
            isSetup: false,
            error: 'RLS_POLICIES_MISSING',
            message: 'Row Level Security policies are not properly configured. Please run the complete-database-setup.sql script.'
          };
        }
      } catch (rlsError) {
        console.error('❌ RLS test failed:', rlsError);
        return {
          isSetup: false,
          error: 'RLS_TEST_FAILED',
          message: 'Unable to test database permissions. Please run the complete database setup script.'
        };
      }
      
      console.log('✅ System setup verified successfully');
      return { isSetup: true, error: null };
    } catch (error) {
      console.error('❌ System setup check failed:', error);
      return { 
        isSetup: false, 
        error: 'SETUP_CHECK_FAILED',
        message: 'Unable to verify system setup. Please ensure your Supabase connection is working and run the complete-database-setup.sql script in your Supabase SQL Editor.' 
      };
    }
  }

  // Enhanced sign in with better error handling and setup verification
  static async signIn(email, password) {
    try {
      console.log('🔄 Signing in user:', email);
      
      // First check if system is properly set up
      const setupCheck = await this.checkSystemSetup();
      if (!setupCheck.isSetup) {
        console.error('❌ System not properly set up:', setupCheck.error);
        throw new Error(`SETUP_REQUIRED: ${setupCheck.message}`);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ SignIn error:', error);
        
        // Enhanced error handling with specific guidance
        if (error.message === 'Invalid login credentials' || error.message.includes('Invalid login credentials')) {
          // Additional check: see if there are any users in the system at all
          try {
            console.log('🔍 Checking if any users exist in the system...');
            
            // First check if we can access the profiles table
            const { data: existingProfiles, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .limit(1);
              
            if (profileError) {
              console.error('❌ Cannot check existing profiles:', profileError);
              // If we can't check profiles, this is likely a setup issue
              if (profileError.code === '42P01') {
                throw new Error(
                  'SETUP_REQUIRED: The profiles table does not exist. Please run the complete-database-setup.sql script in your Supabase SQL Editor before attempting to log in.'
                );
              } else if (profileError.code === '42501') {
                throw new Error(
                  'SETUP_REQUIRED: Database permissions are not configured. Please run the complete-database-setup.sql script in your Supabase SQL Editor.'
                );
              } else {
                throw new Error(
                  'SETUP_REQUIRED: Cannot access user profiles. This suggests the database setup is incomplete. Please run the complete-database-setup.sql script in your Supabase SQL Editor.'
                );
              }
            }
            
            // Check if there are any users at all
            if (!existingProfiles || existingProfiles.length === 0) {
              console.log('ℹ️ No users found in the system');
              throw new Error(
                'SETUP_REQUIRED: No user accounts found in the system. Please run the complete-database-setup.sql script in your Supabase SQL Editor, then create your first account using the "Sign Up" button.'
              );
            }
            
            console.log(`ℹ️ Found ${existingProfiles.length} user(s) in the system`);
            
          } catch (countError) {
            // If the countError is already a SETUP_REQUIRED error, re-throw it
            if (countError.message.includes('SETUP_REQUIRED')) {
              throw countError;
            }
            // Otherwise, it's likely a different kind of error
            console.error('❌ Error checking user count:', countError);
            throw new Error(
              'SETUP_REQUIRED: Cannot verify user accounts. This suggests the database setup may be incomplete. Please run the complete-database-setup.sql script in your Supabase SQL Editor.'
            );
          }
          
          // If we get here, there are users in the system, so it's likely just wrong credentials
          throw new Error(
            'Invalid login credentials. Please check your email and password. If you don\'t have an account yet, please use the "Sign Up" button to create one.'
          );
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error(
            'Please check your email and click the confirmation link before logging in.'
          );
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message.includes('Password')) {
          throw new Error('Invalid password. Please check your password and try again.');
        }
        
        throw error;
      }

      console.log('✅ User signed in successfully');

      // Get comprehensive user profile
      const profile = await this.getUserProfile(data.user.id)
      
      // Log user session
      await this.logUserSession(data.user.id);
      
      return { 
        data: { 
          user: data.user, 
          profile: profile.data 
        }, 
        error: null 
      }
    } catch (error) {
      console.error('❌ SignIn failed:', error);
      return { data: null, error }
    }
  }

  // Sign up new user with comprehensive profile creation
  static async signUp(email, password, userData) {
    try {
      console.log('🔄 Starting comprehensive signup process for:', email);
      
      // Check system setup before attempting signup
      const setupCheck = await this.checkSystemSetup();
      if (!setupCheck.isSetup) {
        console.error('❌ System not properly set up for signup:', setupCheck.error);
        throw new Error(`SETUP_REQUIRED: ${setupCheck.message}`);
      }
      
      // Generate unique username if not provided
      const username = userData.username || this.generateUsername(userData.name, email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            username: username,
            bio: userData.bio || '',
            favorite_genres: userData.favoriteGenres || [],
            favorite_artists: userData.favoriteArtists || []
          }
        }
      })

      if (error) {
        console.error('❌ Auth signup error:', error);
        
        // Check for specific signup errors that might indicate setup issues
        if (error.message?.includes('Database error')) {
          throw new Error('SETUP_REQUIRED: Database error during signup. Please ensure the complete-database-setup.sql script has been executed in your Supabase SQL Editor.');
        }
        
        throw error;
      }

      if (!data.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('✅ User created successfully:', data.user.id);

      // Check if email confirmation is required
      if (!data.session && data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email confirmation required for user:', email);
        return {
          data: {
            user: data.user,
            profile: null,
            emailConfirmationRequired: true
          },
          error: null
        };
      }

      // Wait for auth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify user authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        throw new Error('User authentication verification failed');
      }

      console.log('✅ User authentication verified, creating comprehensive profile...');
      
      let profileImageUrl = null;
      
      // Upload profile image if provided
      if (userData.profileImageFile) {
        console.log('📸 Uploading profile image...');
        const uploadResult = await ImageUploadService.uploadProfilePicture(
          currentUser.id, 
          userData.profileImageFile
        );
        
        if (uploadResult.success) {
          profileImageUrl = uploadResult.url;
          console.log('✅ Profile image uploaded successfully:', profileImageUrl);
        } else {
          console.warn('⚠️  Profile image upload failed:', uploadResult.error);
        }
      }
      
      // Prepare comprehensive profile data
      const profileData = {
        id: currentUser.id,
        email: currentUser.email,
        username: username,
        name: userData.name,
        bio: userData.bio || '',
        favorite_genres: userData.favoriteGenres || [],
        favorite_artists: userData.favoriteArtists || [],
        profile_image: profileImageUrl,
        location: userData.location || '',
        spotify_connected: userData.spotifyConnected || false,
        spotify_data: userData.spotifyData || null
      };

      console.log('📝 Creating profile with data:', {
        ...profileData,
        spotify_data: profileData.spotify_data ? '[Spotify Data Present]' : null
      });

      // Create or update profile (upsert to handle race conditions)
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // Provide specific error messages
        if (profileError.code === '42501') {
          throw new Error('SETUP_REQUIRED: Database permission error. Please ensure you have run the complete-database-setup.sql script in your Supabase SQL Editor.');
        } else if (profileError.code === '42P01') {
          throw new Error('SETUP_REQUIRED: The profiles table does not exist. Please run the complete-database-setup.sql script in your Supabase SQL Editor.');
        } else if (profileError.code === '23505') {
          if (profileError.message.includes('username')) {
            throw new Error('This username is already taken. Please choose a different one.');
          } else {
            throw new Error('A profile with this email already exists.');
          }
        } else if (profileError.code === '23503') {
          throw new Error('User authentication error. Please try signing up again.');
        } else if (profileError.code === '23514') {
          throw new Error('Invalid data format. Please check your input and try again.');
        }
        
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log('✅ Profile created successfully!');
      
      // Log user session
      await this.logUserSession(currentUser.id);
      
      return { 
        data: {
          user: currentUser,
          profile: profileResult,
          emailConfirmationRequired: false
        }, 
        error: null 
      };
    } catch (error) {
      console.error('❌ SignUp failed:', error);
      return { data: null, error }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Get current user with comprehensive profile data
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { data: null, error }
      }
      
      if (user) {
        const profile = await this.getUserProfile(user.id)
        return { 
          data: { 
            user, 
            profile: profile.data 
          }, 
          error: null 
        }
      }
      
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get comprehensive user profile
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_sessions!user_sessions_user_id_fkey(
            login_time,
            ip_address
          )
        `)
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null }
        }
        throw error;
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Update user profile with validation
  static async updateProfile(userId, updates) {
    try {
      let finalUpdates = { ...updates };
      
      // Handle profile image upload if a file is provided
      if (updates.profileImageFile) {
        console.log('📸 Uploading updated profile image...');
        const uploadResult = await ImageUploadService.uploadProfilePicture(
          userId, 
          updates.profileImageFile
        );
        
        if (uploadResult.success) {
          finalUpdates.profile_image = uploadResult.url;
          console.log('✅ Profile image updated successfully');
        } else {
          throw new Error(`Image upload failed: ${uploadResult.error}`);
        }
        
        delete finalUpdates.profileImageFile;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...finalUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Check if username is available
  static async checkUsernameAvailable(username) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (error && error.code === 'PGRST116') {
        return { available: true, error: null }
      }
      
      if (data) {
        return { available: false, error: null }
      }
      
      return { available: true, error: null }
    } catch (error) {
      return { available: false, error }
    }
  }

  // Generate unique username
  static generateUsername(name, email) {
    const baseName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : email.split('@')[0];
    const timestamp = Date.now().toString().slice(-4);
    return `${baseName}${timestamp}`;
  }

  // Log user session for tracking
  static async logUserSession(userId) {
    try {
      await supabase
        .from('user_sessions')
        .insert([{
          user_id: userId,
          login_time: new Date().toISOString(),
          ip_address: null, // Can be populated from request headers
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.warn('Session logging failed:', error);
    }
  }

  // Get user login history
  static async getUserSessions(userId) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)  
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Resend email confirmation
  static async resendEmailConfirmation(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Verify system setup
  static async verifySystemSetup() {
    try {
      console.log('🔍 Verifying authentication system setup...');
      
      // Test database connection
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Database connection failed:', testError);
        return { success: false, error: 'Database connection failed' };
      }
      
      // Test storage bucket
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.find(b => b.id === 'profile-pictures');
      
      if (bucketError || !hasBucket) {
        console.error('❌ Storage bucket not configured properly');
        return { success: false, error: 'Storage bucket missing' };
      }
      
      console.log('✅ Authentication system verified successfully');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ System verification failed:', error);
      return { success: false, error: error.message };
    }
  }
}