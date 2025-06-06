import { supabase } from '../lib/supabase'
import { ImageUploadService } from './imageUploadService'

export class AuthService {  
  // Sign up new user
  static async signUp(email, password, userData) {
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
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

      console.log('User created successfully:', data.user.id);

      // Wait a moment to ensure the auth session is fully established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify user is authenticated before creating profile
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        throw new Error('User authentication verification failed');
      }

      console.log('User authentication verified, creating profile...');
      
      let profileImageUrl = null;
      
      // Upload profile image if provided
      if (userData.profileImageFile) {
        console.log('Uploading profile image...');
        const uploadResult = await ImageUploadService.uploadProfilePicture(
          currentUser.id, 
          userData.profileImageFile
        );
        
        if (uploadResult.success) {
          profileImageUrl = uploadResult.url;
          console.log('Profile image uploaded successfully:', profileImageUrl);
        } else {
          console.warn('Profile image upload failed:', uploadResult.error);
          // Don't fail signup if image upload fails, just log it
        }
      }
      
      // Prepare profile data
      const profileData = {
        id: currentUser.id,
        email: currentUser.email,
        name: userData.name,
        bio: userData.bio || '',
        favorite_genres: userData.favoriteGenres || [],
        favorite_artists: userData.favoriteArtists || [],
        profile_image: profileImageUrl,
        spotify_connected: userData.spotifyConnected || false,
        spotify_data: userData.spotifyData || null
      };

      console.log('Inserting profile data:', profileData);

      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Provide more specific error messages
        if (profileError.code === '42501') {
          throw new Error('Database permission error. Please ensure RLS policies are set up correctly by running the database migration.');
        } else if (profileError.code === '23505') {
          throw new Error('A profile with this email already exists.');
        } else if (profileError.code === '23503') {
          throw new Error('User authentication error. Please try again.');
        }
        
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log('Profile created successfully:', profileResult);
      
      return { 
        data: {
          user: currentUser,
          profile: profileResult
        }, 
        error: null 
      };
    } catch (error) {
      console.error('SignUp failed:', error);
      return { data: null, error }
    }
  }

  // Sign in existing user
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile
      const profile = await this.getUserProfile(data.user.id)
      
      return { 
        data: { 
          user: data.user, 
          profile: profile.data 
        }, 
        error: null 
      }
    } catch (error) {
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

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        // Don't throw error for missing session, just return null data
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

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Handle case where profile doesn't exist
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

  // Update user profile
  static async updateProfile(userId, updates) {
    try {
      let finalUpdates = { ...updates };
      
      // Handle profile image upload if a file is provided
      if (updates.profileImageFile) {
        console.log('Uploading updated profile image...');
        const uploadResult = await ImageUploadService.uploadProfilePicture(
          userId, 
          updates.profileImageFile
        );
        
        if (uploadResult.success) {
          finalUpdates.profile_image = uploadResult.url;
          console.log('Profile image updated successfully:', uploadResult.url);
        } else {
          console.warn('Profile image upload failed:', uploadResult.error);
          throw new Error(`Image upload failed: ${uploadResult.error}`);
        }
        
        // Remove the file from updates since it's not a database field
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
}