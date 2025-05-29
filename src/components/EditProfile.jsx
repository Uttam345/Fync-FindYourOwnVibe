import React, { useState } from 'react';
import { ChevronLeft, Camera, User, Mail, MessageSquare, Music, Sparkles, Save, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditProfile = ({ navigate, user }) => {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    favoriteGenres: user.favoriteGenres || [],
    favoriteArtists: user.favoriteArtists || [],
    location: user.location || '',
    age: user.age || '',
  });
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const genres = [
    'Rock', 'Pop', 'Hip-Hop', 'R&B', 'Country',
    'Electronic', 'Jazz', 'Classical', 'Alternative',
    'Metal', 'Indie', 'Folk', 'Blues', 'Reggae', 'Punk'
  ];

  const suggestedArtists = [
    'The National', 'Arcade Fire', 'Radiohead', 'Taylor Swift', 'Kendrick Lamar',
    'Billie Eilish', 'Arctic Monkeys', 'The Strokes', 'Phoebe Bridgers', 'Frank Ocean'
  ];

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const toggleGenre = (genre) => {
    if (form.favoriteGenres.includes(genre)) {
      setForm({
        ...form,
        favoriteGenres: form.favoriteGenres.filter(g => g !== genre)
      });
    } else {
      setForm({
        ...form,
        favoriteGenres: [...form.favoriteGenres, genre]
      });
    }
  };

  const toggleArtist = (artist) => {
    if (form.favoriteArtists.includes(artist)) {
      setForm({
        ...form,
        favoriteArtists: form.favoriteArtists.filter(a => a !== artist)
      });
    } else {
      setForm({
        ...form,
        favoriteArtists: [...form.favoriteArtists, artist]
      });
    }
  };

  const handlePhotoUpload = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  const handleSave = () => {
    // In a real app, save to backend here
    setShowSaveConfirmation(true);
    setTimeout(() => {
      setShowSaveConfirmation(false);
      navigate('profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Header */}
      <motion.div 
        className="glass border-b border-white/20 p-4 sticky top-0 z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button 
              onClick={() => navigate('profile')} 
              className="p-2 rounded-xl glass border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <h1 className="text-xl font-bold text-white">Edit Profile</h1>
          </div>
          <motion.button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save size={16} />
            Save
          </motion.button>
        </div>
      </motion.div>

      <div className="p-6 space-y-8">
        {/* Profile Picture Section */}
        <motion.div 
          className="glass rounded-3xl p-6 border border-white/20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/30 shadow-lg">
              <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-3 border-white/30 border-t-white rounded-full"></div>
              </div>
            )}
          </motion.div>
          <motion.button 
            onClick={handlePhotoUpload}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isUploading}
          >
            {isUploading ? <Upload size={18} /> : <Camera size={18} />}
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </motion.button>
        </motion.div>

        {/* Basic Information */}
        <motion.div 
          className="glass rounded-3xl p-6 border border-white/20 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-white/80 mb-2 font-medium">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full glass border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-white/80 mb-2 font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full glass border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => handleChange('age', e.target.value)}
                  className="w-full glass border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                  placeholder="25"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 font-medium">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className="w-full glass border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio Section */}
        <motion.div 
          className="glass rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            About You
          </h2>
          <textarea
            value={form.bio}
            onChange={e => handleChange('bio', e.target.value)}
            className="w-full glass border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-all duration-300 resize-none"
            rows={4}
            placeholder="Tell other vibe seekers about yourself..."
          />
          <p className="text-white/60 text-sm mt-2">
            {form.bio.length}/200 characters
          </p>
        </motion.div>

        {/* Favorite Genres */}
        <motion.div 
          className="glass rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-green-400" />
            Favorite Genres
          </h2>
          <p className="text-white/70 text-sm mb-4">Select up to 5 genres that best describe your musical taste</p>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre, index) => (
              <motion.button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  form.favoriteGenres.includes(genre)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'glass border border-white/30 text-white hover:bg-white/10'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!form.favoriteGenres.includes(genre) && form.favoriteGenres.length >= 5}
              >
                {genre}
              </motion.button>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-3">
            {form.favoriteGenres.length}/5 selected
          </p>
        </motion.div>

        {/* Favorite Artists */}
        <motion.div 
          className="glass rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Favorite Artists
          </h2>
          <p className="text-white/70 text-sm mb-4">Choose artists you love to help find better matches</p>
          <div className="flex flex-wrap gap-3">
            {suggestedArtists.map((artist, index) => (
              <motion.button
                key={artist}
                onClick={() => toggleArtist(artist)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  form.favoriteArtists.includes(artist)
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                    : 'glass border border-white/30 text-white hover:bg-white/10'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {artist}
              </motion.button>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-3">
            {form.favoriteArtists.length} artists selected
          </p>
        </motion.div>

        {/* Save Button - Mobile Fixed */}
        <motion.div 
          className="md:hidden fixed bottom-20 left-4 right-4 z-20"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={20} className="inline mr-2" />
            Save Changes
          </motion.button>
        </motion.div>
      </div>

      {/* Save Confirmation */}
      <AnimatePresence>
        {showSaveConfirmation && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass rounded-3xl p-8 text-center border border-white/20 max-w-sm mx-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                ✨
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Profile Updated!</h3>
              <p className="text-white/70">Your changes have been saved successfully.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfile;
