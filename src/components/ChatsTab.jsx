import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Music, Clock } from 'lucide-react';
import { ChatService } from '../services/chatService';
import { ConnectionService } from '../services/connectionService';

const ChatsTab = ({ navigate, user }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const { data, error } = await ChatService.getUserChats(user.id);
      
      if (error) {
        console.error('Error loading chats:', error);
        // Fallback to sample data
        setChats(getSampleChats());
      } else {
        setChats(data || getSampleChats());
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats(getSampleChats());
    } finally {
      setLoading(false);
    }
  };

  const getSampleChats = () => [
    {
      id: '1',
      name: 'Alice',
      last_message: 'See you at the concert!',
      last_message_time: '2m ago',
      avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg',
      compatibility: 85
    },
    {
      id: '2',
      name: 'Bob',
      last_message: 'Let\'s jam soon!',
      last_message_time: '10m ago',
      avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg',
      compatibility: 78
    },
    {
      id: '3',
      name: 'Charlie',
      last_message: 'Check out this new track!',
      last_message_time: '1h ago',
      avatar_url: 'https://randomuser.me/api/portraits/men/3.jpg',
      compatibility: 91
    }
  ];

  return (
    <div className="h-full bg-transparent">
      <motion.div 
        className="p-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Messages</h2>
        <p className="text-white/80 text-lg">Connect with your music matches</p>
      </motion.div>
      
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat, index) => (
            <motion.div
              key={chat.id}
              className="glass rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-300"
              onClick={() => navigate('chat', { chatId: chat.id })}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={chat.avatar_url || chat.avatar}
                    alt={chat.name}
                    className="w-14 h-14 rounded-full border-2 border-white/30 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1 ml-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-white text-lg">{chat.name}</h3>
                    <div className="flex items-center text-white/60 text-xs">
                      <Clock size={12} className="mr-1" />
                      {chat.last_message_time || chat.time}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm truncate pr-4">{chat.last_message || chat.lastMessage}</p>
                  <div className="flex items-center mt-2 text-white/50 text-xs">
                    <Music size={12} className="mr-1" />
                    <span>Shared music taste: {chat.compatibility || 85}%</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MessageCircle size={20} className="text-white/40" />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-white/40" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-white/60">Start discovering fans to begin chatting!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatsTab;