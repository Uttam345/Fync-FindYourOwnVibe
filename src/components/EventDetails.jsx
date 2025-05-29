import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, MapPin, Clock, Users, Music, Star, MessageSquare, Heart, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const EventDetails = ({ navigate, eventId }) => {
  const [event, setEvent] = useState(null);
  const [isAttending, setIsAttending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setEvent({
      id: eventId,
      name: 'Summer Sounds Festival',
      date: '2025-06-20',
      image: '/api/placeholder/500/300',
      location: 'Central Park, New York',
      address: 'East 72nd Street, New York, NY 10021',
      time: '12:00 PM - 11:00 PM',
      attendees: 1243,
      attendeeImages: Array(6).fill('/api/placeholder/60/60'),
      lineup: ['The National', 'Arcade Fire', 'Phoebe Bridgers', 'Japanese Breakfast', 'Big Thief'],
      description: 'Annual indie and alternative music festival featuring top artists and emerging talent across three stages. Food vendors, art installations, and immersive experiences throughout the park.',
      ticketLink: 'https://example.com/tickets',
      price: '$89',
      category: 'Music Festival',
      rating: 4.8
    });
  }, [eventId]);

  if (!event) return (
    <div className="flex justify-center items-center h-full bg-transparent">
      <LoadingSpinner />
    </div>
  );

  const toggleAttending = () => {
    setIsAttending(!isAttending);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <motion.div 
        className="relative h-80 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('events')}
          className="absolute top-6 left-6 glass rounded-full p-3 text-white border border-white/30 hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ChevronLeft size={20} />
        </motion.button>
        
        {/* Share Button */}
        <motion.button
          className="absolute top-6 right-6 glass rounded-full p-3 text-white border border-white/30 hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Share size={20} />
        </motion.button>
        
        {/* Event Category Badge */}
        <motion.div 
          className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Music className="w-4 h-4 inline mr-1" />
          {event.category}
        </motion.div>
        
        {/* Event Title & Quick Info */}
        <motion.div 
          className="absolute bottom-6 left-6 right-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-white mb-3">{event.name}</h1>
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">{event.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="font-medium">{event.attendees} attending</span>
            </div>
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              {event.price}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Event Info Cards */}
        <motion.div 
          className="grid grid-cols-1 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Date & Time Card */}
          <div className="glass rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Date & Time</h3>
                <p className="text-white/80">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-white/60 text-sm">{event.time}</p>
              </div>
            </div>
          </div>
          
          {/* Location Card */}
          <div className="glass rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Location</h3>
                <p className="text-white/80 font-medium">{event.location}</p>
                <p className="text-white/60 text-sm">{event.address}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div 
          className="glass rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            About This Event
          </h2>
          <p className="text-white/80 leading-relaxed">{event.description}</p>
        </motion.div>

        {/* Lineup */}
        <motion.div 
          className="glass rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" />
            Featured Artists
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {event.lineup.map((artist, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300/30 rounded-xl p-3 flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <span className="text-white font-medium">{artist}</span>
                <div className="flex items-center gap-1 text-purple-300">
                  <Music className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Attendees */}
        <motion.div 
          className="glass rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Attendees ({event.attendees})
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex">
              {event.attendeeImages.map((img, index) => (
                <motion.div
                  key={index}
                  className="w-12 h-12 rounded-full overflow-hidden border-3 border-white/30 -ml-2 first:ml-0"
                  style={{ zIndex: event.attendeeImages.length - index }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.1 + index * 0.05 }}
                  whileHover={{ scale: 1.1, zIndex: 100 }}
                >
                  <img src={img} alt="Attendee" className="w-full h-full object-cover" />
                </motion.div>
              ))}
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center -ml-2 text-white text-sm font-bold border-3 border-white/30"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                +{event.attendees - 6}
              </motion.div>
            </div>
            <p className="text-white/60 text-sm ml-2">
              Join {event.attendees} vibe seekers at this event
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <motion.div 
        className="fixed bottom-16 inset-x-0 p-4 glass border-t border-white/20"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-3 max-w-md mx-auto">
          <motion.button
            onClick={() => navigate('event-chat', { eventId: event.id })}
            className="flex-1 glass border border-white/30 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare size={18} />
            Event Chat
          </motion.button>
          <motion.button
            onClick={toggleAttending}
            className={`flex-2 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isAttending
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart size={18} className={isAttending ? 'fill-current' : ''} />
            {isAttending ? 'Cancel RSVP' : 'RSVP Now'}
          </motion.button>
        </div>
      </motion.div>

      {/* RSVP Confirmation */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 text-center border border-white/20 z-50"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <motion.div 
              className="text-4xl mb-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {isAttending ? '🎉' : '💔'}
            </motion.div>
            <p className="text-white font-semibold">
              {isAttending ? 'You\'re going!' : 'RSVP cancelled'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetails;
