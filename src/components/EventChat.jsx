import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Plus, Smile, Camera, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventChat = ({ navigate, eventId }) => {
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setEvent({
      id: eventId,
      name: 'Summer Sounds Festival',
      date: '2025-06-20',
      image: '/api/placeholder/400/200'
    });

    setMessages([
      {
        id: 1,
        user: {
          id: 101,
          name: 'Emma Wilson',
          image: '/api/placeholder/40/40'
        },
        text: 'Hey everyone! Super excited for this festival! Who else is going to camp out?',
        timestamp: '2025-05-12T14:30:00Z',
        type: 'text'
      },
      {
        id: 2,
        user: {
          id: 102,
          name: 'Liam Parker',
          image: '/api/placeholder/40/40'
        },
        text: 'I am camping! Anyone want to meet up beforehand to carpool?',
        timestamp: '2025-05-12T14:45:00Z',
        type: 'text'
      },
      {
        id: 3,
        user: {
          id: 103,
          name: 'Sophia Chen',
          image: '/api/placeholder/40/40'
        },
        text: 'I am definitely interested in carpooling. Coming from Brooklyn area.',
        timestamp: '2025-05-12T15:02:00Z',
        type: 'text'
      },
      {
        id: 4,
        user: {
          id: 1, // Current user
          name: 'Alex Johnson',
          image: '/api/placeholder/40/40'
        },
        text: 'Hey all! First time going to this festival. Any recommendations on what to bring?',
        timestamp: '2025-05-13T10:15:00Z',
        type: 'text'
      }
    ]);
  }, [eventId]);

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
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  if (!event) return (
    <div className="flex justify-center items-center h-full bg-transparent">
      <div className="text-white">Loading chat...</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Enhanced Header */}
      <motion.div 
        className="glass border-b border-white/20 p-4 sticky top-0 z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate('event-details', { eventId: event.id })}
            className="p-2 rounded-xl glass border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg">{event.name}</h1>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Music className="w-4 h-4" />
              <span>Event Chat • {messages.length} messages</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white/30"></div>
              ))}
            </div>
            <div className="text-white/70 text-sm">+24 online</div>
          </div>
        </div>
      </motion.div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isCurrentUser = message.user.id === 1;
            return (
              <motion.div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
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
                
                <div className={`max-w-xs ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                  {!isCurrentUser && (
                    <p className="text-xs font-medium mb-1 text-white/70 px-1">
                      {message.user.name}
                    </p>
                  )}
                  
                  <motion.div 
                    className={`rounded-2xl p-4 shadow-lg ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto' 
                        : 'glass border border-white/20 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${isCurrentUser ? 'text-white/80' : 'text-white/60'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
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
                <div className="flex items-center gap-1">
                  <span className="text-sm">Someone is typing</span>
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
            className="p-3 glass border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={20} />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
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

export default EventChat;
