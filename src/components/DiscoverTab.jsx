import React, { useState, useEffect } from 'react';
import { Heart, X, MapPin, Music, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ConnectionService } from '../services/connectionService';
import { AuthService } from '../services/authService';

// DISCOVER TAB COMPONENT
const DiscoverTab = ({ navigate, user }) => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMatched, setHasMatched] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load potential matches
  useEffect(() => {
    loadPotentialMatches();
  }, [user]);

  const loadPotentialMatches = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await ConnectionService.getPotentialMatches(user.id);
      
      if (error) {
        console.error('Error loading potential matches:', error);
        // Fallback to sample data
        setProfiles(getSampleProfiles());
      } else {
        setProfiles(data || getSampleProfiles());
      }
    } catch (error) {
      console.error('Error loading potential matches:', error);
      setProfiles(getSampleProfiles());
    } finally {
      setLoading(false);
    }
  };

  const getSampleProfiles = () => [
    {
      id: 101,
      name: 'Emma Wilson',
      age: 24,
      location: 'Brooklyn, NY',
      bio: 'Indie rock enthusiast and vinyl collector. Always up for discovering new bands.',
      avatar_url: '/api/placeholder/400/500',
      compatibility: 85,
      common_artists: ['The National', 'Arcade Fire', 'Phoebe Bridgers'],
      upcoming_events: ['Summer Sounds Festival', 'Indie Night at Mercury Lounge']
    },
    {
      id: 102,
      name: 'Liam Parker',
      age: 29,
      location: 'Austin, TX',
      bio: 'Music producer and avid concert-goer. Let\'s talk about that band you just discovered.',
      avatar_url: '/api/placeholder/400/500',
      compatibility: 78,
      common_artists: ['Tame Impala', 'King Gizzard', 'Khruangbin'],
      upcoming_events: ['Austin City Limits', 'Desert Daze Festival']
    },
    {
      id: 103,
      name: 'Sophia Chen',
      age: 26,
      location: 'Seattle, WA',
      bio: 'Festival photographer with a passion for indie folk and alternative rock.',
      avatar_url: '/api/placeholder/400/500',
      compatibility: 91,
      common_artists: ['Bon Iver', 'Fleet Foxes', 'Big Thief'],
      upcoming_events: ['Northwest Folk Festival', 'Timber! Outdoor Music Festival']
    }
  ];    const handleSwipe = async (direction) => {
    setSwipeDirection(direction);
    
    if (!user || !currentProfile) return;
    
    // Handle right swipe (like)
    if (direction === 'right') {
      try {
        const { data, error } = await ConnectionService.createConnection(user.id, currentProfile.id);
        
        if (!error && data?.is_match) {
          setHasMatched(true);
          setTimeout(() => setHasMatched(false), 3000);
        }
      } catch (error) {
        console.error('Error creating connection:', error);
        // Still show match animation for demo purposes
        if (Math.random() > 0.5) {
          setHasMatched(true);
          setTimeout(() => setHasMatched(false), 3000);
        }
      }
    }
    
    // Move to next profile after animation
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Reset when we run out of profiles
        setCurrentIndex(0);
      }
      setSwipeDirection(null);
    }, 300);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      handleSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe('left');
    }
  };
  
  const currentProfile = profiles[currentIndex];
    return (
    <div className="h-full flex flex-col bg-transparent">
      <motion.div 
        className="p-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Discover Fans</h2>
        <p className="text-white/80 text-lg">Find people with similar music taste</p>
        <div className="flex justify-center space-x-2 mt-4">          <div className="flex items-center space-x-1 text-white/70">
            <Music className="w-4 h-4" />
            <span className="text-sm">Vibe Seekers</span>
          </div>
          <div className="flex items-center space-x-1 text-white/70">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Perfect Matches</span>
          </div>
        </div>
      </motion.div>
      
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : profiles.length > 0 && currentProfile ? (
        <div className="flex-1 p-4 flex justify-center items-center">
          <motion.div 
            className="relative max-w-sm w-full glass rounded-3xl overflow-hidden shadow-2xl"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05, rotate: swipeDirection === 'right' ? 5 : swipeDirection === 'left' ? -5 : 0 }}
            animate={swipeDirection ? {
              x: swipeDirection === 'right' ? 300 : -300,
              opacity: 0,
              rotate: swipeDirection === 'right' ? 30 : -30
            } : { x: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
          >
            <div className="relative">              <img 
                src={currentProfile.avatar_url || currentProfile.image} 
                alt={currentProfile.name}
                className="w-full h-72 sm:h-80 object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Match Percentage Badge */}
              <motion.div 
                className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                {currentProfile.compatibility}% Match
              </motion.div>
              
              {/* Profile Info */}
              <div className="absolute bottom-0 w-full p-6 text-white">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold mb-2">{currentProfile.name}, {currentProfile.age}</h3>
                  <div className="flex items-center text-white/90 mb-3">
                    <MapPin size={16} className="mr-2" />
                    <span className="font-medium">{currentProfile.location}</span>
                  </div>
                  <p className="text-white/80 mb-4 leading-relaxed">{currentProfile.bio}</p>
                  
                  <div className="space-y-3">
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Common Artists</p>
                      <div className="flex flex-wrap gap-1">
                        {(currentProfile.common_artists || currentProfile.commonArtists || []).map((artist, index) => (
                          <span key={index} className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                            {artist}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Upcoming Events</p>
                      <div className="space-y-1">
                        {(currentProfile.upcoming_events || currentProfile.upcomingEvents || []).map((event, index) => (
                          <div key={index} className="text-sm font-medium">{event}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center">
          <p className="text-white/60 text-lg">No more profiles to show</p>
        </div>
      )}
      
      <motion.div
        className="flex justify-center gap-8 p-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button 
          onClick={() => handleSwipe('left')}
          className="glass border border-red-400/30 text-red-400 p-4 rounded-full shadow-xl hover:bg-red-500/20 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={32} />
        </motion.button>
        
        <motion.button 
          onClick={() => handleSwipe('right')}
          className="glass border border-green-400/30 text-green-400 p-4 rounded-full shadow-xl hover:bg-green-500/20 transition-all duration-300 pulse-glow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={32} />
        </motion.button>
      </motion.div>
      
      {/* Enhanced Match notification popup */}
      <AnimatePresence>
        {hasMatched && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass rounded-3xl p-8 text-center max-w-sm w-full border border-white/20"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🎉
              </motion.div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
                It's a Match!
              </h3>
              <p className="text-white/80 mb-6 text-lg">You and {profiles[currentIndex-1]?.name || 'this person'} can now chat!</p>
              <div className="flex gap-3">
                <motion.button 
                  className="flex-1 glass border border-white/20 text-white py-3 rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Keep Browsing
                </motion.button>
                <motion.button 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Say Hello
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoverTab;