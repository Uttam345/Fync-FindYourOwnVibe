import React, { useState, useEffect } from 'react';
import { Users, Calendar, MapPin, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventService } from '../services/eventService';

const EventsTab = ({ navigate }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await EventService.getEvents();
      if (error) {
        console.error('Error loading events:', error);
        // Fallback to sample data if database fails
        setEvents(getSampleEvents());
      } else {
        setEvents(data || getSampleEvents());
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents(getSampleEvents());
    } finally {
      setLoading(false);
    }
  };

  const getSampleEvents = () => [
    {
      id: 1,
      title: 'Summer Sounds Festival',
      date: '2025-06-20T18:00:00Z',
      image: '/api/placeholder/500/300',
      location: 'Central Park, New York',
      attendees_count: 1243,
      lineup: ['The National', 'Arcade Fire', 'Phoebe Bridgers', 'Japanese Breakfast'],
      description: 'Annual indie and alternative music festival featuring top artists and emerging talent.'
    },
    {
      id: 2,
      title: 'Midnight Jazz Club',
      date: '2025-05-25T21:00:00Z',
      image: '/api/placeholder/500/300',
      location: 'Blue Note, New York',
      attendees_count: 89,
      lineup: ['Robert Glasper', 'Esperanza Spalding', 'Kamasi Washington'],
      description: 'An intimate night of contemporary jazz with some of the genre\'s most innovative performers.'
    },
    {
      id: 3,
      title: 'Electronic Underground',
      date: '2025-06-10T22:00:00Z',
      image: '/api/placeholder/500/300',
      location: 'Warehouse District, Detroit',
      attendees_count: 456,
      lineup: ['Charlotte de Witte', 'Amelie Lens', 'VTSS'],
      description: 'Underground techno experience in Detroit\'s historic warehouse district.'    }
  ];
  return (
    <div className="h-full bg-transparent">
      <motion.div 
        className="p-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Upcoming Events</h2>
        <p className="text-white/80 text-lg">Find events and connect with attendees</p>
      </motion.div>
        <div className="px-4 space-y-6 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No events found</p>
          </div>
        ) : (
          events.map((event, index) => (
          <motion.div
            key={event.id}
            className="glass rounded-3xl overflow-hidden shadow-xl border border-white/20 cursor-pointer"
            onClick={() => navigate('event-details', { eventId: event.id })}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Event Badge */}
              <motion.div 
                className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Star className="w-4 h-4 inline mr-1" />
                Featured
              </motion.div>
              
              {/* Quick Stats */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                <div className="glass rounded-full px-3 py-1 flex items-center">
                  <Users size={14} className="text-white mr-1" />
                  <span className="text-white text-sm font-medium">{event.attendees_count}</span>
                </div>
                <div className="glass rounded-full px-3 py-1 flex items-center">
                  <Clock size={14} className="text-white mr-1" />
                  <span className="text-white text-sm font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-white/80">
                  <Calendar size={16} className="mr-3 text-purple-300" />
                  <span className="font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-white/80">
                  <MapPin size={16} className="mr-3 text-purple-300" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>
              
              <p className="text-white/70 text-sm mb-4 leading-relaxed">{event.description}</p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Featured Artists</p>
                  <div className="flex flex-wrap gap-2">
                    {event.lineup.slice(0, 3).map((artist, artistIndex) => (
                      <span 
                        key={artistIndex} 
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-300/30 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {artist}
                      </span>
                    ))}
                    {event.lineup.length > 3 && (
                      <span className="text-white/50 text-sm">+{event.lineup.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="mt-4 flex justify-between items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="text-white/60 text-sm">Tap to view details</span>
                <div className="flex items-center space-x-1 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Available</span>
                </div>
              </motion.div>            </div>
          </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsTab;
