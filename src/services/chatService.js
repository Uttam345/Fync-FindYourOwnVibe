import { supabase } from '../lib/supabase'

export class ChatService {
  // Get user chats
  static async getUserChats(userId) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages!chats_id_fkey(content, created_at)
        `)
        .contains('participants', [userId])
        .order('last_message_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Get chat messages
  static async getChatMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey(name, profile_image)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  // Send message
  static async sendMessage(chatId, senderId, content, messageType = 'text') {
    try {
      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: senderId,
          content,
          message_type: messageType
        }])
        .select()
        .single()

      if (messageError) throw messageError

      // Update chat's last message
      const { error: chatError } = await supabase
        .from('chats')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', chatId)

      if (chatError) throw chatError

      return { data: message, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Create new chat
  static async createChat(participants, chatType = 'direct', eventId = null, name = null) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([{
          participants,
          chat_type: chatType,
          event_id: eventId,
          name
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Subscribe to new messages
  static subscribeToMessages(chatId, callback) {
    return supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, 
        callback
      )
      .subscribe()
  }

  // Get or create direct chat between two users
  static async getOrCreateDirectChat(userId1, userId2) {
    try {
      // First, try to find existing chat
      const { data: existingChats, error: searchError } = await supabase
        .from('chats')
        .select('*')
        .eq('chat_type', 'direct')
        .contains('participants', [userId1])
        .contains('participants', [userId2])

      if (searchError) throw searchError

      if (existingChats && existingChats.length > 0) {
        return { data: existingChats[0], error: null }
      }

      // Create new chat if none exists
      return await this.createChat([userId1, userId2], 'direct')
    } catch (error) {
      return { data: null, error }
    }
  }
}
