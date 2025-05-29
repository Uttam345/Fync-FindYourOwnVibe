import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Heart, MessageSquare, MapPin, Calendar, Music, MoreHorizontal, Share2, Bookmark } from 'lucide-react';

const SharedMemories = ({ navigate }) => {
  const [memories, setMemories] = useState([]);
  const [likedMemories, setLikedMemories] = useState(new Set());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setMemories([
      {
        id: 1,
        image: '/api/placeholder/500/500',
        caption: 'Amazing night at the Summer Sounds Festival! The National was incredible! 🎵 The energy was off the charts and the crowd was singing every word. Moments like these remind me why I love live music so much!',
        date: '2024-06-21',
        location: 'Central Park, New York',
        likes: 24,
        comments: 7,
        tagged: [
          { id: 101, name: 'Emma Wilson' },
          { id: 102, name: 'Liam Parker' }
        ],
        user: {
          id: 1,
          name: 'Alex Johnson',
          image: '/api/placeholder/40/40'
        },
        type: 'concert',
        mood: 'euphoric'
      },
      {
        id: 2,
        image: '/api/placeholder/500/500',
        caption: 'Backstage with the band! Such a surreal experience meeting Arcade Fire in person. They were so down to earth and passionate about their craft. #bestdayever #arcadefire',
        date: '2024-05-15',
        location: 'Madison Square Garden, New York',
        likes: 48,
        comments: 12,
        tagged: [
          { id: 103, name: 'Sophia Chen' }
        ],
        user: {
          id: 1,
          name: 'Alex Johnson',
          image: '/api/placeholder/40/40'
        },
        type: 'backstage',
        mood: 'excited'
      },
      {
        id: 3,
        image: '/api/placeholder/500/500',
        caption: 'Sunset sessions at Coachella with my music fam! Nothing beats discovering new artists in the desert with your best friends. The vibes were immaculate! 🌅',
        date: '2024-04-20',
        location: 'Coachella Valley, CA',
        likes: 67,
        comments: 18,
        tagged: [
          { id: 101, name: 'Emma Wilson' },
          { id: 102, name: 'Liam Parker' },
          { id: 103, name: 'Sophia Chen' }
        ],
        user: {
          id: 1,
          name: 'Alex Johnson',
          image: '/api/placeholder/40/40'
        },
        type: 'festival',
        mood: 'blissful'
      }
    ]);
  }, []);

  const handleLike = (memoryId) => {
    setLikedMemories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memoryId)) {
        newSet.delete(memoryId);
        setMemories(memories.map(m => 
          m.id === memoryId ? { ...m, likes: m.likes - 1 } : m
        ));
      } else {
        newSet.add(memoryId);
        setMemories(memories.map(m => 
          m.id === memoryId ? { ...m, likes: m.likes + 1 } : m
        ));
      }
      return newSet;
    });
  };

  const filteredMemories = memories.filter(memory => {
    if (filter === 'all') return true;
    return memory.type === filter;
  });

  const moodColors = {
    euphoric: 'from-purple-400 to-pink-400',
    excited: 'from-orange-400 to-red-400',
    blissful: 'from-blue-400 to-indigo-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
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
              <Music className="text-purple-600" size={22} />
              <h1 className="font-bold text-gray-800 text-lg">Music Memories</h1>
            </div>
          </div>
          <button
            onClick={() => navigate('create-memory')}
            className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Memories' },
              { key: 'concert', label: 'Concerts' },
              { key: 'festival', label: 'Festivals' },
              { key: 'backstage', label: 'Backstage' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === key
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memories Feed */}
      <div className="space-y-6 p-4">
        {filteredMemories.map((memory, index) => (
          <div 
            key={memory.id} 
            className="glass-card overflow-hidden animate-fade-in-up group hover:scale-[1.01] transition-all duration-300"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Memory Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={memory.user.image}
                  alt={memory.user.name}
                  className="w-12 h-12 rounded-full mr-3 border-2 border-purple-200 group-hover:scale-110 transition-all duration-300"
                />
                <div>
                  <p className="font-medium text-gray-800">{memory.user.name}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      <span>{memory.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      <span>{new Date(memory.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${moodColors[memory.mood]} text-white text-xs font-medium`}>
                  {memory.mood}
                </div>
                <button className="p-1 hover:bg-white/20 rounded-full transition-all duration-300">
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Memory Image */}
            <div className="relative overflow-hidden">
              <img
                src={memory.image}
                alt="Memory"
                className="w-full h-80 object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Memory Content */}
            <div className="p-4">
              <p className="text-gray-800 leading-relaxed mb-3">{memory.caption}</p>
              
              {/* Tagged Friends */}
              {memory.tagged.length > 0 && (
                <div className="flex items-center mb-3">
                  <span className="text-sm text-gray-600 mr-2">with</span>
                  <div className="flex flex-wrap gap-1">
                    {memory.tagged.map((person, idx) => (
                      <span 
                        key={person.id} 
                        className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer transition-colors duration-300"
                      >
                        {person.name}{idx < memory.tagged.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-500 mb-3 border-t border-gray-100 pt-3">
                <span className="flex items-center">
                  <Heart size={14} className="mr-1" />
                  {memory.likes} likes
                </span>
                <span className="flex items-center">
                  <MessageSquare size={14} className="mr-1" />
                  {memory.comments} comments
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex border-t border-gray-100 pt-3">
                <button 
                  onClick={() => handleLike(memory.id)}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    likedMemories.has(memory.id)
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart 
                    size={18} 
                    className={`mr-2 ${likedMemories.has(memory.id) ? 'fill-current' : ''}`} 
                  />
                  {likedMemories.has(memory.id) ? 'Liked' : 'Like'}
                </button>
                <button className="flex-1 flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105">
                  <MessageSquare size={18} className="mr-2" />
                  Comment
                </button>
                <button className="flex-1 flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105">
                  <Share2 size={18} className="mr-2" />
                  Share
                </button>
                <button className="flex-1 flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:scale-105">
                  <Bookmark size={18} className="mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMemories.length === 0 && (
          <div className="text-center py-12">
            <Music size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No memories found</h3>
            <p className="text-gray-500 mb-4">Start creating some amazing music memories!</p>
            <button
              onClick={() => navigate('create-memory')}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Create Your First Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedMemories;
