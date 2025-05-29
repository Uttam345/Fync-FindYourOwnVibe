import { supabase } from '../lib/supabase'

export class MemoryService {
  // Get all memories
  static async getMemories(userId = null) {
    try {
      let query = supabase
        .from('memories')
        .select(`
          *,
          profiles!memories_user_id_fkey(name, profile_image),
          events(title, location)
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Create new memory
  static async createMemory(memoryData) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert([memoryData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get memory by ID
  static async getMemory(memoryId) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          profiles!memories_user_id_fkey(name, profile_image),
          events(title, location)
        `)
        .eq('id', memoryId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Update memory
  static async updateMemory(memoryId, updates) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', memoryId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Delete memory
  static async deleteMemory(memoryId) {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Like/unlike memory
  static async toggleLike(memoryId, increment = true) {
    try {
      const { data, error } = await supabase
        .rpc('update_memory_likes', {
          memory_id: memoryId,
          increment_value: increment ? 1 : -1
        })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}
