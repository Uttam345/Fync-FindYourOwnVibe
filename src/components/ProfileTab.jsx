import React, { useState, useEffect } from 'react';
import { Edit, Users, Heart, Calendar, Music, Star, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthService } from '../services/authService';

const ProfileTab = ({ navigate, user, profile }) => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      // App.jsx will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use profile data with fallback to user data
  const displayData = {
    name: profile?.name || profile?.display_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    bio: profile?.bio || 'Music lover exploring new sounds',
    avatar_url: profile?.avatar_url || '/api/placeholder/150/150',
    favorite_genres: profile?.favorite_genres || ['Indie', 'Rock', 'Electronic'],
    location: profile?.location || 'Vibe City'
  };

  return (
    <div className="h-full bg-transparent pb-20">
      {/* Profile Header */}
      <motion.div 
        className="glass border-b border-white/20 p-8 flex flex-col items-center relative overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-300/10 rounded-full"></div>
        </div>
        
        <motion.div 
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 mb-4 bg-white/10 backdrop-blur-sm shadow-xl">
            <img src={displayData.avatar_url} alt={displayData.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
        </motion.div>
        
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-1">{displayData.name}</h2>
          <p className="text-white/70 text-sm mb-3">{displayData.email}</p>
          <p className="text-white/80 text-center leading-relaxed max-w-xs">{displayData.bio}</p>
          {displayData.location && (
            <p className="text-white/60 text-sm mt-2">📍 {displayData.location}</p>
          )}
        </motion.div>
        
        <motion.div 
          className="flex gap-2 mt-4 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {displayData.favorite_genres.map((genre, index) => (
            <motion.span 
              key={genre} 
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-300/30 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
            >
              {genre}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex gap-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={() => navigate('edit-profile')}
            className="glass border border-white/30 text-white rounded-2xl px-6 py-3 flex items-center gap-2 font-medium hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit size={16} /> Edit Profile
          </motion.button>
          <motion.button
            onClick={() => navigate('connections')}
            className="glass border border-white/30 text-white rounded-2xl px-6 py-3 flex items-center gap-2 font-medium hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users size={16} /> Connections
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Profile Actions */}
      <div className="p-6 space-y-4">
        {[
          { icon: Heart, label: 'My Music Memories', action: 'memories', gradient: 'from-pink-500 to-red-500' },
          { icon: Calendar, label: 'My Events', action: 'events', gradient: 'from-blue-500 to-purple-500' },
          { icon: Music, label: 'Music Preferences', action: 'edit-profile', gradient: 'from-green-500 to-teal-500' },
          { icon: Settings, label: 'Settings', action: 'settings', gradient: 'from-gray-500 to-gray-600' }
        ].map((item, index) => (
          <motion.button
            key={item.label}
            onClick={() => navigate(item.action)}
            className="w-full glass border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
              <item.icon size={20} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-white font-semibold text-lg">{item.label}</h3>
              <p className="text-white/60 text-sm">Manage your {item.label.toLowerCase()}</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            </div>
          </motion.button>
        ))}
        
        {/* Sign Out Button */}
        <motion.button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full glass border border-red-400/30 rounded-2xl p-4 flex items-center gap-4 hover:bg-red-500/10 transition-all duration-300 group"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <LogOut size={20} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-white font-semibold text-lg">
              {loading ? 'Signing Out...' : 'Sign Out'}
            </h3>
            <p className="text-white/60 text-sm">Log out of your account</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default ProfileTab;