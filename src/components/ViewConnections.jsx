import React, { useState, useEffect } from 'react';
import { ChevronLeft, MessageSquare, UserPlus, Search, Users, Music, MapPin } from 'lucide-react';

const mockConnections = [
  {
    id: 101,
    name: 'Emma Wilson',
    image: '/api/placeholder/40/40',
    genres: ['Indie', 'Rock'],
    location: 'Brooklyn, NY',
    status: 'online',
    mutualFriends: 3,
    lastSeen: 'Active now'
  },
  {
    id: 102,
    name: 'Liam Parker',
    image: '/api/placeholder/40/40',
    genres: ['Electronic', 'Indie'],
    location: 'Austin, TX',
    status: 'offline',
    mutualFriends: 5,
    lastSeen: '2 hours ago'
  },
  {
    id: 103,
    name: 'Sophia Chen',
    image: '/api/placeholder/40/40',
    genres: ['Folk', 'Alternative'],
    location: 'Seattle, WA',
    status: 'online',
    mutualFriends: 1,
    lastSeen: 'Active now'
  }
];

const ViewConnections = ({ navigate }) => {
  const [connections, setConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    setConnections(mockConnections);
  }, []);

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'online' && conn.status === 'online') ||
                         (filterBy === 'offline' && conn.status === 'offline');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="glass-effect sticky top-0 z-10 border-b border-white/20">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('profile')} 
              className="mr-3 p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} className="text-purple-700" />
            </button>
            <div className="flex items-center space-x-2">
              <Users className="text-purple-600" size={22} />
              <h1 className="font-bold text-gray-800 text-lg">My Connections</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-600 font-medium">
              {connections.length} friends
            </span>
            <button className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-110 transition-all duration-300 shadow-lg">
              <UserPlus size={18} />
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2 mt-3">
            {[
              { key: 'all', label: 'All', icon: Users },
              { key: 'online', label: 'Online', icon: Users },
              { key: 'offline', label: 'Offline', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterBy(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                  filterBy === key
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="p-4 space-y-3">
        {filteredConnections.map((conn, index) => (
          <div
            key={conn.id}
            className="glass-card group hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center p-4">
              {/* Profile Section */}
              <div className="relative">
                <img
                  src={conn.image}
                  alt={conn.name}
                  className="w-14 h-14 rounded-full border-3 border-gradient shadow-lg group-hover:scale-110 transition-all duration-300"
                />
                {/* Online Status */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  conn.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                } animate-pulse`} />
              </div>
              
              {/* User Info */}
              <div className="flex-1 ml-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                    {conn.name}
                  </h3>
                  {conn.status === 'online' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium animate-pulse">
                      Online
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin size={12} className="mr-1" />
                  <span>{conn.location}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <Users size={12} className="mr-1" />
                  <span>{conn.mutualFriends} mutual friends</span>
                  <span className="mx-2">•</span>
                  <span>{conn.lastSeen}</span>
                </div>
                
                {/* Genres */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {conn.genres.map((genre, idx) => (
                    <span
                      key={genre}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 ${
                        idx % 2 === 0 
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' 
                          : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                      }`}
                    >
                      <Music size={10} className="inline mr-1" />
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => navigate('chat', { chatId: conn.id })}
                  className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:animate-bounce"
                >
                  <MessageSquare size={18} />
                </button>
                <button
                  onClick={() => navigate('user-profile', { userId: conn.id })}
                  className="px-4 py-2 bg-white/70 text-purple-600 rounded-full text-sm font-medium hover:bg-white hover:scale-105 transition-all duration-300 border border-purple-200"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredConnections.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No connections found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewConnections;
