import React, { useState, useEffect } from 'react';
import { Music, Camera, Sparkles, Heart, Users, ArrowRight, Upload, User, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotifyService } from '../services/spotifyService';
import { ImageUploadService } from '../services/imageUploadService';
import { AuthService } from '../services/authService';

// Enhanced Onboarding Process Component with comprehensive profile creation
const OnboardingProcess = ({ onComplete, spotifyData }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    bio: '',
    location: '',
    profileImage: null,
    profileImageFile: null,
    favoriteGenres: [],
    favoriteArtists: [],
    spotifyConnected: false,
    spotifyData: null,
  });
  
  const genres = [
    'Rock', 'Pop', 'Hip-Hop', 'R&B', 'Country', 
    'Electronic', 'Jazz', 'Classical', 'Alternative', 
    'Metal', 'Indie', 'Folk', 'Blues'
  ];

  const handleSpotifyConnect = async () => {
    try {
      setLoading(true);
      setError('');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        throw new Error('Spotify authorization failed: ' + error);
      }
      
      if (code && state) {
        const result = await SpotifyService.handleCallback(code, state);
        
        if (result.error) {
          throw result.error;
        }
        
        setUserData({
          ...userData,
          spotifyConnected: true,
          spotifyData: result.data,
          favoriteGenres: SpotifyService.extractGenres(result.data.topArtists || []),
          favoriteArtists: result.data.topArtists?.slice(0, 10).map(artist => artist.name) || [],
        });
        
        window.history.replaceState({}, document.title, window.location.pathname);
        setStep(3);
      } else {
        SpotifyService.initiateAuth();
      }
    } catch (err) {
      console.error('Spotify connection failed:', err);
      setError('Failed to connect to Spotify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state && step === 2) {
      handleSpotifyConnect();
    }
  }, [step]);

  useEffect(() => {
    if (spotifyData && !userData.spotifyConnected) {
      setUserData({
        ...userData,
        spotifyConnected: true,
        spotifyData: spotifyData,
        favoriteGenres: SpotifyService.extractGenres(spotifyData.topArtists || []),
        favoriteArtists: spotifyData.topArtists?.slice(0, 10).map(artist => artist.name) || [],
      });
      setStep(3);
    }
  }, [spotifyData]);

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
      });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (userData.favoriteGenres.length === 0) {
        setError('Please select at least one favorite genre');
        setLoading(false);
        return;
      }

      if (!userData.username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      const result = await onComplete(userData);
      if (!result || !result.success) {
        setError(result?.error || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Onboarding completion failed:', err);
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');

      setUserData({
        ...userData,
        profileImageFile: file,
        profileImage: URL.createObjectURL(file)
      });

    } catch (err) {
      console.error('Error selecting image:', err);
      setError(err.message || 'Failed to select image');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    return '';
  };

  const validateUsername = async (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters long';
    if (username.length > 30) return 'Username must be less than 30 characters';
    if (!/^[A-Za-z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    
    // Check availability
    const { available } = await AuthService.checkUsernameAvailable(username);
    if (!available) return 'This username is already taken';
    
    return '';
  };

  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = async (field, value) => {
    setUserData({ ...userData, [field]: value });
    
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'name':
        error = validateName(value);
        break;
      case 'username':
        if (value) {
          error = await validateUsername(value);
        }
        break;
    }
    
    setValidationErrors({
      ...validationErrors,
      [field]: error
    });
  };

  const isStep1Valid = () => {
    return userData.name.trim() && 
           userData.username.trim() && 
           userData.email.trim() && 
           userData.password.trim() &&
           !validationErrors.email && 
           !validationErrors.password &&
           !validationErrors.username &&
           !validationErrors.name;
  };

  return (
    <div className="min-h-screen gradient-bg p-4 relative">
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
            {step === 1 && <Users className="w-8 h-8 text-black" />}
            {step === 2 && <Music className="w-8 h-8 text-black" />}
            {step === 3 && <Sparkles className="w-8 h-8 text-black" />}
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
          
          {/* Error Display */}
          {error && (
            <motion.div 
              className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
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
                <label className="block text-white/90 mb-2 font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    validationErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder="Your full name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-red-300 text-sm">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-white/90 mb-2 font-medium flex items-center">
                  <AtSign className="w-4 h-4 mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    validationErrors.username ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder="Choose a unique username"
                />
                {validationErrors.username && (
                  <p className="mt-1 text-red-300 text-sm">{validationErrors.username}</p>
                )}
                <p className="mt-1 text-white/60 text-xs">3-30 characters, letters, numbers, and underscores only</p>
              </div>
              
              <div>
                <label className="block text-white/90 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    validationErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder="you@example.com"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-red-300 text-sm">{validationErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-white/90 mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    validationErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder="Must be at least 8 characters"
                />
                {validationErrors.password && (
                  <p className="mt-1 text-red-300 text-sm">{validationErrors.password}</p>
                )}
                <p className="mt-1 text-white/60 text-xs">Password must be at least 8 characters long</p>
              </div>
              
              <motion.button 
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isStep1Valid()}
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
                <p className="text-gray-500 mb-6 leading-relaxed">Connect your music account to find fans with similar taste and get personalized recommendations</p>
                
                {userData.spotifyConnected ? (
                  <motion.div 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg mb-4 flex items-center justify-center gap-3"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Music size={24} />
                    Connected to Spotify ✓
                    <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  </motion.div>
                ) : (
                  <motion.button 
                    onClick={handleSpotifyConnect}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <Music size={24} />
                    {loading ? 'Connecting...' : 'Connect with Spotify'}
                    <div className={`w-2 h-2 bg-white/30 rounded-full ${loading ? 'animate-spin' : 'animate-pulse'}`}></div>
                  </motion.button>
                )}
                
                {userData.spotifyConnected && userData.spotifyData && (
                  <motion.div 
                    className="mb-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-white font-semibold mb-2">Your Music Taste</h3>
                    <p className="text-white/70 text-sm mb-2">Found {userData.favoriteArtists.length} favorite artists</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.favoriteGenres.slice(0, 4).map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
                
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
                  {userData.spotifyConnected ? 'Continue' : 'Skip and select genres manually'}
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                  rows={3}
                  placeholder="Tell other fans about yourself, your favorite artists, concerts you've been to..."
                />
              </div>

              <div>
                <label className="block text-white/90 mb-2 font-medium">Location (Optional)</label>
                <input
                  type="text"
                  value={userData.location}
                  onChange={(e) => setUserData({...userData, location: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="City, State/Country"
                />
              </div>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white/30 bg-white/10 backdrop-blur-sm">
                    {userData.profileImage ? (
                      <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                    disabled={loading}
                  />
                  <motion.label
                    htmlFor="profile-image-upload"
                    className={`absolute bottom-2 right-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    whileHover={{ scale: loading ? 1 : 1.1 }}
                    whileTap={{ scale: loading ? 1 : 0.9 }}
                  >
                    {loading ? <Upload size={16} className="animate-spin" /> : <Camera size={16} />}
                  </motion.label>
                </div>
                <p className="text-white/60 text-sm">
                  {userData.profileImageFile ? 'Image selected! Will upload during registration.' : 'Upload your profile photo'}
                </p>
              </div>
              
              <motion.button 
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={userData.favoriteGenres.length === 0 || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Creating Account...' : 'Complete Setup'} <Heart size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingProcess;