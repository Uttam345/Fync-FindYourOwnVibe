import { supabase } from '../lib/supabase'

export class ConnectionService {
  // Get user connections
  static async getUserConnections(userId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          friend:profiles!connections_friend_id_fkey(
            id, name, profile_image, bio, favorite_genres, location
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Send connection request
  static async sendConnectionRequest(userId, friendId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert([{
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Accept connection request
  static async acceptConnectionRequest(connectionId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single()

      if (error) throw error

      // Create reverse connection
      const { data: reverseData, error: reverseError } = await supabase
        .from('connections')
        .insert([{
          user_id: data.friend_id,
          friend_id: data.user_id,
          status: 'accepted'
        }])

      if (reverseError) throw reverseError

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get pending connection requests
  static async getPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_user_id_fkey(
            id, name, profile_image, bio
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Search users for connections
  static async searchUsers(query, currentUserId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_image, bio, favorite_genres, location')
        .neq('id', currentUserId)
        .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Get potential matches for discover tab
  static async getPotentialMatches(userId, limit = 10) {
    try {
      // Get current user's profile for matching
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('favorite_genres, favorite_artists')
        .eq('id', userId)
        .single()

      // Get potential matches excluding current user and existing connections
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('friend_id')
        .eq('user_id', userId)

      const excludeIds = existingConnections?.map(conn => conn.friend_id) || []
      excludeIds.push(userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_image, bio, favorite_genres, favorite_artists, location')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(limit)

      if (error) throw error

      // Transform the data to match the expected format
      const matches = data.map(profile => ({
        id: profile.id,
        name: profile.name,
        avatar_url: profile.profile_image,
        bio: profile.bio,
        location: profile.location || 'Unknown location',
        common_artists: profile.favorite_artists?.filter(artist => 
          currentUser?.favorite_artists?.includes(artist)
        ) || [],
        compatibility: Math.floor(Math.random() * 40 + 60), // Random compatibility score between 60-100
        upcoming_events: Math.floor(Math.random() * 3), // Random number of upcoming events (0-2)
        age: Math.floor(Math.random() * 15 + 20) // Random age between 20-35
      }))

      return { data: matches, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Check connection status between two users
  static async getConnectionStatus(userId, friendId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('status')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data: data?.status || 'none', error: null }
    } catch (error) {
      return { data: 'none', error }
    }
  }

  // Remove connection
  static async removeConnection(userId, friendId) {
    try {
      // Remove both directions of the connection
      const { error: error1 } = await supabase
        .from('connections')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId)

      const { error: error2 } = await supabase
        .from('connections')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId)

      if (error1) throw error1
      if (error2) throw error2

      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}