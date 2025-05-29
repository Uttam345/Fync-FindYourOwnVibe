import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Plus, Smile, Image, Music, Mic, Heart, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockChats = [
  {
    id: 1,
    name: 'Emma Wilson',
    image: '/api/placeholder/40/40',
    status: 'online',
    bio: 'Indie rock enthusiast',
    commonArtists: ['The National', 'Arcade Fire'],
    messages: [
      {
        id: 1,
        user: {
          id: 101,
          name: 'Emma Wilson',
          image: '/api/placeholder/40/40'
        },
        text: 'Hey! Did you check out the new album from The National?',
        timestamp: '2025-05-12T14:30:00Z',
        type: 'text'
      },
      {
        id: 2,
        user: {
          id: 1, // Current user
          name: 'Alex Johnson',
          image: '/api/placeholder/40/40'
        },
        text: "Yes! It's amazing. What's your favorite track?",
        timestamp: '2025-05-12T14:35:00Z',
        type: 'text'
      },
      {
        id: 3,
        user: {
          id: 101,
          name: 'Emma Wilson',
          image: '/api/placeholder/40/40'
        },
        text: '"Oblivions" is on repeat for me.',
        timestamp: '2025-05-12T14:36:00Z',
        type: 'text'
      },
      {
        id: 4,
        user: {
          id: 101,
          name: 'Emma Wilson',
          image: '/api/placeholder/40/40'
        },
        text: '🎵 Now Playing: The National - Oblivions',
        timestamp: '2025-05-12T14:37:00Z',
        type: 'music',
        musicData: {
          title: 'Oblivions',
          artist: 'The National',
          album: 'First Two Pages of Frankenstein',
          image: '/api/placeholder/60/60'
        }
      }
    ]
  },
  {
    id: 2,
    name: 'Liam Parker',
    image: '/api/placeholder/40/40',
    status: 'away',
    bio: 'Music producer',
    commonArtists: ['Tame Impala', 'King Gizzard'],
    messages: [
      {
        id: 1,
        user: {
          id: 102,
          name: 'Liam Parker',
          image: '/api/placeholder/40/40'
        },
        text: "Let's meet at the Austin City Limits entrance at 5pm?",
        timestamp: '2025-05-13T09:00:00Z',
        type: 'text'
      }
    ]
  }
];

const ChatInterface = ({ navigate, chatId }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Find chat by chatId (number or string)
    const foundChat = mockChats.find(
      (c) => c.id === Number(chatId) || c.id === chatId
    );
    setChat(foundChat);
    setMessages(foundChat ? foundChat.messages : []);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      user: {
        id: 1,
        name: 'Alex Johnson',
        image: '/api/placeholder/40/40'
      },
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const renderMessage = (message) => {
    if (message.type === 'music') {
      return (
        <motion.div 
          className="glass rounded-2xl p-4 border border-white/20 max-w-xs"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <img 
              src={message.musicData.image} 
              alt={message.musicData.album}
              className="w-12 h-12 rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {message.musicData.title}
              </p>
              <p className="text-white/70 text-xs truncate">
                {message.musicData.artist}
              </p>
            </div>
            <motion.button
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Music className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      );
    }
    
    return (
      <div className="leading-relaxed">
        {message.text}
      </div>
    );
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-transparent">
        <div className="text-white">Chat not found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Enhanced Header */}
      <motion.div 
        className="glass border-b border-white/20 p-4 sticky top-0 z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('chats')}
              className="p-2 rounded-xl glass border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            <div className="relative">
              <img
                src={chat.image}
                alt={chat.name}
                className="w-12 h-12 rounded-full border-2 border-white/30"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                chat.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
            </div>
            
            <div>
              <h1 className="font-bold text-white text-lg">{chat.name}</h1>
              <p className="text-white/70 text-sm">{chat.status === 'online' ? 'Online now' : 'Last seen recently'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              className="p-2 glass border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Phone size={18} />
            </motion.button>
            <motion.button
              className="p-2 glass border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Video size={18} />
            </motion.button>
          </div>
        </div>
        
        {/* Common Artists */}
        {chat.commonArtists && (
          <motion.div 
            className="mt-3 flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Music className="w-4 h-4 text-purple-300" />
            <span className="text-white/60 text-sm">
              You both like: {chat.commonArtists.join(', ')}
            </span>
          </motion.div>
        )}
      </motion.div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isCurrentUser = message.user.id === 1;
            return (
              <motion.div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                {!isCurrentUser && (
                  <motion.img
                    src={message.user.image}
                    alt={message.user.name}
                    className="w-10 h-10 rounded-full mr-3 mt-1 border-2 border-white/30"
                    whileHover={{ scale: 1.1 }}
                  />
                )}
                
                <div className={`max-w-xs ${isCurrentUser ? 'order-1' : 'order-2'} relative`}>
                  <motion.div 
                    className={`rounded-2xl p-4 shadow-lg ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto' 
                        : 'glass border border-white/20 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    {renderMessage(message)}
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${isCurrentUser ? 'text-white/80' : 'text-white/60'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {!isCurrentUser && (
                        <motion.button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="w-3 h-3 text-pink-400" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                {isCurrentUser && (
                  <motion.img
                    src={message.user.image}
                    alt={message.user.name}
                    className="w-10 h-10 rounded-full ml-3 mt-1 border-2 border-white/30 order-2"
                    whileHover={{ scale: 1.1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="glass border border-white/20 rounded-2xl p-4 text-white/70">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{chat.name} is typing</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-white/60 rounded-full"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Attachment Options */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div 
            className="glass border-t border-white/20 p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex justify-around">
              {[
                { icon: Image, label: 'Photo', color: 'from-blue-500 to-cyan-500' },
                { icon: Music, label: 'Song', color: 'from-purple-500 to-pink-500' },
                { icon: Mic, label: 'Voice', color: 'from-green-500 to-teal-500' },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-r ${item.color} text-white`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={24} />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Message Input */}
      <motion.form
        onSubmit={handleSendMessage}
        className="glass border-t border-white/20 p-4 fixed bottom-16 inset-x-0"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <motion.button
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            className={`p-3 glass border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all duration-300 ${
              showAttachments ? 'bg-white/10' : ''
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={20} className={showAttachments ? 'rotate-45' : ''} />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${chat.name}...`}
              className="w-full glass border border-white/30 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all duration-300"
            />
            <motion.button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Smile size={18} />
            </motion.button>
          </div>
          
          <motion.button
            type="submit"
            className={`p-3 rounded-xl font-medium transition-all duration-300 ${
              newMessage.trim() 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl' 
                : 'glass border border-white/30 text-white/50'
            }`}
            disabled={!newMessage.trim()}
            whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
            whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default ChatInterface;
