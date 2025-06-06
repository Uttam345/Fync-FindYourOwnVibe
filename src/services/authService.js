import { supabase } from '../lib/supabase'
import { ImageUploadService } from './imageUploadService'

export class AuthService {  
  // Sign up new user with comprehensive profile creation
  static async signUp(email, password, userData) {
    try {
      console.log('🔄 Starting comprehensive signup process for:', email);
      
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
        console.error('Auth signup error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('✅ User created successfully:', data.user.id);

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
          throw new Error('Database permission error. Please ensure you have run the latest database migration.');
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
          profile: profileResult
        }, 
        error: null 
      };
    } catch (error) {
      console.error('❌ SignUp failed:', error);
      return { data: null, error }
    }
  }

  // Sign in existing user
  static async signIn(email, password) {
    try {
      console.log('🔄 Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

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