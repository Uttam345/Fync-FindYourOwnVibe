import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Heart, Sparkles, Users } from 'lucide-react';

// Welcome Screen / Login Component
const LoginScreen = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const result = await onLogin(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSignUpClick = () => {
    onNavigate('onboarding');
  };
    return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gradient-bg relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-purple-300/20 rounded-full"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-12 h-12 bg-blue-300/20 rounded-full"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md glass rounded-3xl shadow-2xl p-8 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 pulse-glow">
            <Music className="w-8 h-8 text-white" />
          </div>          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            FYNC
          </h1>
          <p className="text-white/80 mt-2 font-medium">Find Your Own Vibe - Connect with fans who share your music taste</p>
          
          {/* Feature Icons */}
          <div className="flex justify-center space-x-4 mt-4">
            <motion.div 
              className="flex items-center space-x-1 text-white/70"
              whileHover={{ scale: 1.05 }}
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">Match</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-white/70"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Connect</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-1 text-white/70"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Discover</span>
            </motion.div>
          </div>
        </motion.div>
        
        {error && (
          <motion.div 
            className="bg-red-500/20 border border-red-400/30 text-red-100 p-3 rounded-xl mb-4 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <label className="block text-white/90 mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-white/90 mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
            <motion.button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </motion.button>
        </motion.form>
        
        <motion.p 
          className="text-center mt-6 text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >          Don't have an account?{' '}
          <button 
            onClick={handleSignUpClick} 
            className="text-white font-semibold hover:text-purple-200 transition-colors"
          >
            Sign Up
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;