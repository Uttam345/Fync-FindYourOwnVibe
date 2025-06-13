import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Heart, Sparkles, Users, Mail, RefreshCw, AlertTriangle, Database, ExternalLink, UserPlus } from 'lucide-react';

// Welcome Screen / Login Component
const LoginScreen = ({ onLogin, onNavigate, emailConfirmationPending, onResendConfirmation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showSignupSuggestion, setShowSignupSuggestion] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendMessage('');
    setShowSetupGuide(false);
    setShowSignupSuggestion(false);
    
    // Validate email and password
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setValidationErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }
    
    setLoading(true);
    const result = await onLogin(email, password);
    
    if (!result.success) {
      const errorMessage = result.error || 'Login failed. Please try again.';
      
      // Check if this is a setup-related error
      if (errorMessage.includes('SETUP_REQUIRED')) {
        setShowSetupGuide(true);
        setError(errorMessage.replace('SETUP_REQUIRED: ', ''));
      } else if (errorMessage.includes('Invalid login credentials') || 
                 errorMessage.includes('No account exists with this email')) {
        // Show signup suggestion for credential errors
        setShowSignupSuggestion(true);
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    }
    setLoading(false);
  };

  const handleSignUpClick = () => {
    onNavigate('onboarding');
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    setResendLoading(true);
    setResendMessage('');
    setError('');
    
    const result = await onResendConfirmation(email);
    
    if (result.success) {
      setResendMessage(result.message);
    } else {
      setError(result.error);
    }
    
    setResendLoading(false);
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setValidationErrors({
      ...validationErrors,
      email: validateEmail(emailValue)
    });
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setValidationErrors({
      ...validationErrors,
      password: validatePassword(passwordValue)
    });
  };

  // Check if form is valid
  const isFormValid = () => {
    return email.trim() && 
           password.trim() && 
           !validationErrors.email && 
           !validationErrors.password;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gradient-bg relative">
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
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
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

        {/* Database Setup Guide */}
        <AnimatePresence>
          {showSetupGuide && (
            <motion.div 
              className="bg-amber-500/20 border border-amber-400/30 text-amber-100 p-4 rounded-xl mb-4 backdrop-blur-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Database Setup Required</span>
              </div>
              <p className="text-sm mb-3">
                The FYNC database needs to be configured before you can log in. Please follow these steps:
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside mb-3">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-amber-200 hover:underline inline-flex items-center">
                  Supabase Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                </a></li>
                <li>Select your FYNC project</li>
                <li>Navigate to SQL Editor</li>
                <li>Copy and paste the contents from <code className="bg-amber-600/30 px-1 rounded">complete-database-setup.sql</code></li>
                <li>Click "Run" to execute the setup</li>
              </ol>
              <p className="text-xs text-amber-200">
                After setup, you can create a new account using the "Sign Up" button below.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signup Suggestion */}
        <AnimatePresence>
          {showSignupSuggestion && !showSetupGuide && (
            <motion.div 
              className="bg-blue-500/20 border border-blue-400/30 text-blue-100 p-4 rounded-xl mb-4 backdrop-blur-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Need an Account?</span>
              </div>
              <p className="text-sm mb-3">
                If you don't have an account yet, you'll need to create one first.
              </p>
              <button
                onClick={handleSignUpClick}
                className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Create New Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email confirmation pending message */}
        {emailConfirmationPending && (
          <motion.div 
            className="bg-blue-500/20 border border-blue-400/30 text-blue-100 p-4 rounded-xl mb-4 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Email Confirmation Required</span>
            </div>
            <p className="text-sm mb-3">
              Please check your email and click the confirmation link before logging in.
            </p>
            <button
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="flex items-center space-x-1 text-blue-200 hover:text-white transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
              <span>{resendLoading ? 'Sending...' : 'Resend confirmation email'}</span>
            </button>
          </motion.div>
        )}

        {/* Success message */}
        {resendMessage && (
          <motion.div 
            className="bg-green-500/20 border border-green-400/30 text-green-100 p-3 rounded-xl mb-4 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {resendMessage}
          </motion.div>
        )}
        
        {error && !showSetupGuide && !showSignupSuggestion && (
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
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                validationErrors.email 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-white/20 focus:ring-purple-400'
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
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                validationErrors.password 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-white/20 focus:ring-purple-400'
              }`}
              placeholder="At least 8 characters"
            />
            {validationErrors.password && (
              <p className="mt-1 text-red-300 text-sm">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-white/60 text-xs">Password must be at least 8 characters long</p>
          </div>

          <motion.button 
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading || !isFormValid() ? 1 : 1.02 }}
            whileTap={{ scale: loading || !isFormValid() ? 1 : 0.98 }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </motion.button>
        </motion.form>
        
        <motion.p 
          className="text-center mt-6 text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Don't have an account?{' '}
          <button 
            onClick={handleSignUpClick} 
            className="text-white font-semibold rounded-2xl hover:text-purple-200 transition-colors"
          >
            Sign Up
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;