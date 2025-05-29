import { supabase } from '../lib/supabase'

export class AuthService {
  // Sign up new user
  static async signUp(email, password, userData) {
    try {
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

      if (error) throw error

      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: userData.name,
              bio: userData.bio || '',
              favorite_genres: userData.favoriteGenres || [],
              favorite_artists: userData.favoriteArtists || [],
              profile_image: userData.profileImage || '/api/placeholder/100/100'
            }
          ])

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (error) {
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
      console.log('🔍 AuthService: Getting current user...');
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.log('❌ AuthService: Error getting user:', error.message);
        throw error;
      }
      
      if (user) {
        console.log('✅ AuthService: User found:', user.email);
        console.log('🔍 AuthService: Getting user profile...');
        const profile = await this.getUserProfile(user.id)
        console.log('✅ AuthService: Profile data:', profile.data ? 'Found' : 'Not found');
        return { 
          data: { 
            user, 
            profile: profile.data 
          }, 
          error: null 
        }
      }
      
      console.log('ℹ️ AuthService: No user currently authenticated');
      return { data: null, error: null }
    } catch (error) {
      console.error('❌ AuthService: getCurrentUser failed:', error);
      return { data: null, error }
    }
  }
  // Get user profile
  static async getUserProfile(userId) {
    try {
      console.log('🔍 AuthService: Getting profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('❌ AuthService: Error getting profile:', error.message);
        if (error.code === 'PGRST116') {
          console.log('ℹ️ AuthService: Profile table might not exist or user has no profile');
        }
        throw error;
      }
      
      console.log('✅ AuthService: Profile retrieved successfully');
      return { data, error: null }
    } catch (error) {
      console.error('❌ AuthService: getUserProfile failed:', error);
      return { data: null, error }
    }
  }

  // Update user profile
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
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
