import React, { useState } from 'react';
import { Music, Camera, Sparkles, Heart, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Onboarding Process Component
const OnboardingProcess = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    profileImage: '/api/placeholder/150/150',
    favoriteGenres: [],
    favoriteArtists: [],
    spotifyConnected: false,
  });
  
  const genres = [
    'Rock', 'Pop', 'Hip-Hop', 'R&B', 'Country', 
    'Electronic', 'Jazz', 'Classical', 'Alternative', 
    'Metal', 'Indie', 'Folk', 'Blues'
  ];
  
  const handleSpotifyConnect = () => {
    // In a real app, this would initiate OAuth flow
    setUserData({
      ...userData,
      spotifyConnected: true,
      favoriteGenres: ['Alternative', 'Indie', 'Rock'],
    });
    setStep(3);
  };
  
  const toggleGenre = (genre) => {
    if (userData.favoriteGenres.includes(genre)) {
      setUserData({
        ...userData,
        favoriteGenres: userData.favoriteGenres.filter(g => g !== genre)
      });
    } else {
      setUserData({
        ...userData,
        favoriteGenres: [...userData.favoriteGenres, genre]
      });    }
  };
  
  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await onComplete(userData);
      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full"
          animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-32 right-16 w-20 h-20 bg-purple-300/10 rounded-full"
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-32 left-20 w-24 h-24 bg-blue-300/10 rounded-full"
          animate={{ y: [0, -25, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md mx-auto glass rounded-3xl shadow-2xl p-8 relative z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 pulse-glow">
            {step === 1 && <Users className="w-8 h-8 text-white" />}
            {step === 2 && <Music className="w-8 h-8 text-white" />}
            {step === 3 && <Sparkles className="w-8 h-8 text-white" />}
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent mb-2">
            {step === 1 && "Create Your Account"}
            {step === 2 && "Connect Your Music"}
            {step === 3 && "Complete Your Profile"}
          </h2>
            <p className="text-white/80 text-sm">
            {step === 1 && "Join the community of vibe seekers"}
            {step === 2 && "Let's discover your musical taste"}
            {step === 3 && "Finish setting up your profile"}
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-3">
              {[1, 2, 3].map((s) => (
                <motion.div 
                  key={s}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step >= s 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                      : 'bg-white/20'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * s }}
                />
              ))}
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <label className="block text-white/90 mb-2 font-medium">Full Name</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-white/90 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-white/90 mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({...userData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Create a secure password"
                />
              </div>
              
              <motion.button 
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!userData.name || !userData.email || !userData.password}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div 
              key="step2"
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <p className="text-white/80 mb-6 leading-relaxed">Connect your music account to find fans with similar taste and get personalized recommendations</p>
                
                <motion.button 
                  onClick={handleSpotifyConnect}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Music size={24} />
                  Connect with Spotify
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                </motion.button>
                
                <div className="my-6 flex items-center">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="px-4 text-white/60 text-sm font-medium">or</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>
                
                <motion.button 
                  onClick={() => setStep(3)}
                  className="w-full glass border border-white/30 text-white py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip and select genres manually
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div 
              key="step3"
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {!userData.spotifyConnected && (
                <div>
                  <label className="block text-white/90 mb-3 font-medium">Select your favorite genres</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre, index) => (
                      <motion.button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          userData.favoriteGenres.includes(genre)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                        }`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {genre}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-white/90 mb-2 font-medium">Bio</label>
                <textarea
                  value={userData.bio}
                  onChange={(e) => setUserData({...userData, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                  rows={3}
                  placeholder="Tell other fans about yourself, your favorite artists, concerts you've been to..."
                />
              </div>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white/30 bg-white/10 backdrop-blur-sm">
                    <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <motion.button 
                    className="absolute bottom-2 right-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera size={16} />
                  </motion.button>
                </div>
                <p className="text-white/60 text-sm">Upload your profile photo</p>
              </div>
              
              <motion.button 
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={userData.favoriteGenres.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Complete Setup <Heart size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingProcess;