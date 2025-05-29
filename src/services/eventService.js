import { supabase } from '../lib/supabase'

export class EventService {
  // Get all events
  static async getEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Get event by ID
  static async getEvent(eventId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Create new event
  static async createEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get upcoming events
  static async getUpcomingEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(10)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Search events
  static async searchEvents(query) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${query}%,location.ilike.%${query}%,genre.ilike.%${query}%`)
        .order('date', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }
}
