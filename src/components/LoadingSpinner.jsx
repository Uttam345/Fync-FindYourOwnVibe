import React from 'react';
import { motion } from 'framer-motion';
import { Music, Heart, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 glass flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Icons */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"></div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Music className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="relative mb-4">
          <motion.div
            className="absolute -left-8 -top-2"
            animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          >
            <Heart className="w-4 h-4 text-pink-300" />
          </motion.div>
          
          <motion.div
            className="absolute -right-8 -top-2"
            animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
          </motion.div>
        </div>
        
        {/* Loading Text */}
        <motion.h3
          className="text-white text-xl font-semibold mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.h3>
        
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-white/60 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
