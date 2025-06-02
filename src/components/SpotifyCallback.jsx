import React, { useEffect, useState } from 'react';
import { SpotifyService } from '../services/spotifyService';
import { motion } from 'framer-motion';
import { Music, CheckCircle, XCircle, Loader } from 'lucide-react';

const SpotifyCallback = ({ onComplete, userId }) => {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Connecting to Spotify...');
  const [spotifyData, setSpotifyData] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        throw new Error(`Spotify authorization failed: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      setMessage('Processing Spotify data...');

      // Handle the OAuth callback
      const result = await SpotifyService.handleCallback(code, state, userId);

      if (result.error) {
        throw result.error;
      }

      setSpotifyData(result.data);
      setStatus('success');
      setMessage('Successfully connected to Spotify!');

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Notify parent component after a brief success display
      setTimeout(() => {
        if (onComplete) {
          onComplete(result.data);
        }
      }, 2000);

    } catch (err) {
      console.error('Spotify callback error:', err);
      setStatus('error');
      setMessage(err.message || 'Failed to connect to Spotify');
    }
  };

  const handleRetry = () => {
    SpotifyService.initiateAuth();
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          {/* Status Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {status === 'processing' && (
              <Loader className="w-16 h-16 text-green-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-400" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-400" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {status === 'processing' && 'Connecting to Spotify'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </motion.h2>

          {/* Message */}
          <motion.p
            className="text-white/70 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {message}
          </motion.p>

          {/* Success Details */}
          {status === 'success' && spotifyData && (
            <motion.div
              className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-500/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Music className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-semibold">Music Profile Updated</span>
              </div>
              <div className="text-sm text-white/80">
                <p>• {spotifyData.topArtists?.length || 0} favorite artists found</p>
                <p>• {spotifyData.topTracks?.length || 0} top tracks analyzed</p>
                <p>• Music preferences updated automatically</p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {status === 'error' && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Music size={20} />
                Try Again
              </button>
              <button
                onClick={handleSkip}
                className="w-full glass border border-white/30 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Skip and Continue
              </button>
            </motion.div>
          )}

          {/* Processing Animation */}
          {status === 'processing' && (
            <motion.div
              className="flex justify-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SpotifyCallback;
