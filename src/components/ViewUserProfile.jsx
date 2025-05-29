import React, { useEffect, useState } from 'react';
import { ChevronLeft, MessageSquare, Heart, MapPin, Calendar, Music, Users, Star, Camera, Share2 } from 'lucide-react';

const mockProfiles = [
  {
    id: 101,
    name: 'Emma Wilson',
    age: 24,
    location: 'Brooklyn, NY',
    bio: 'Indie rock enthusiast and vinyl collector. Always up for discovering new bands and sharing musical experiences! 🎵',
    image: '/api/placeholder/400/500',
    coverImage: '/api/placeholder/800/300',
    genres: ['Indie', 'Rock', 'Alternative'],
    events: ['Summer Sounds Festival', 'Indie Night at Mercury Lounge', 'Brooklyn Music Week'],
    mutualFriends: 8,
    isOnline: true,
    joinedDate: '2023-03-15',
    favoriteArtists: ['The National', 'Arcade Fire', 'Vampire Weekend'],
    concertsAttended: 47,
    memoriesShared: 23
  },
  {
    id: 102,
    name: 'Liam Parker',
    age: 29,
    location: 'Austin, TX',
    bio: 'Music producer and avid concert-goer. Let\'s talk about that band you just discovered.',
    image: '/api/placeholder/400/500',
    coverImage: '/api/placeholder/800/300',
    genres: ['Electronic', 'Indie', 'Techno'],
    events: ['Austin City Limits', 'Desert Daze Festival'],
    mutualFriends: 12,
    isOnline: false,
    joinedDate: '2023-01-20',
    favoriteArtists: ['Four Tet', 'Caribou', 'Jamie xx'],
    concertsAttended: 62,
    memoriesShared: 35
  },
  {
    id: 103,
    name: 'Sophia Chen',
    age: 26,
    location: 'Seattle, WA',
    bio: 'Festival photographer with a passion for indie folk and alternative rock.',
    image: '/api/placeholder/400/500',
    coverImage: '/api/placeholder/800/300',
    genres: ['Folk', 'Alternative', 'Indie'],
    events: ['Northwest Folk Festival', 'Timber! Outdoor Music Festival'],
    mutualFriends: 5,
    isOnline: true,
    joinedDate: '2023-02-10',
    favoriteArtists: ['Fleet Foxes', 'Bon Iver', 'The Head and the Heart'],
    concertsAttended: 34,
    memoriesShared: 18
  }
];

const ViewUserProfile = ({ navigate, userId }) => {
  const [profile, setProfile] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    setProfile(mockProfiles.find(p => String(p.id) === String(userId)));
  }, [userId]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-10 border-b border-white/20">
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('connections')} 
            className="p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={20} className="text-purple-700" />
          </button>
          <h1 className="font-bold text-gray-800">{profile.name}</h1>
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <Share2 size={20} className="text-purple-700" />
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={profile.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative -mt-16 px-6">
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-200">
              <img 
                src={profile.image} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            {profile.isOnline && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center justify-center text-gray-600 mb-2">
            <MapPin size={16} className="mr-1" />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Users size={14} className="mr-1" />
            <span>{profile.mutualFriends} mutual friends</span>
            <span className="mx-2">•</span>
            <Calendar size={14} className="mr-1" />
            <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Concerts', value: profile.concertsAttended, icon: Music },
            { label: 'Memories', value: profile.memoriesShared, icon: Camera },
            { label: 'Friends', value: profile.mutualFriends, icon: Users }
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card text-center p-4">
              <Icon className="mx-auto text-purple-600 mb-2" size={20} />
              <div className="text-xl font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Star className="mr-2 text-purple-600" size={18} />
            About
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>

        {/* Music Preferences */}
        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Music className="mr-2 text-purple-600" size={18} />
            Music Taste
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 block mb-2">Favorite Genres</span>
              <div className="flex gap-2 flex-wrap">
                {profile.genres.map((genre, idx) => (
                  <span
                    key={genre}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      idx % 3 === 0 
                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' 
                        : idx % 3 === 1
                        ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700'
                        : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700'
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 block mb-2">Favorite Artists</span>
              <div className="flex gap-2 flex-wrap">
                {profile.favoriteArtists.map(artist => (
                  <span
                    key={artist}
                    className="px-3 py-1 bg-white/70 text-gray-700 rounded-full text-sm border border-purple-200 hover:bg-white hover:scale-105 transition-all duration-300"
                  >
                    {artist}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Calendar className="mr-2 text-purple-600" size={18} />
            Upcoming Events
          </h3>
          <div className="space-y-2">
            {profile.events.map(event => (
              <div key={event} className="flex items-center p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                <Music size={16} className="mr-3 text-purple-600" />
                <span className="text-gray-700">{event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => navigate('chat', { chatId: profile.id })}
            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <MessageSquare size={18} /> 
            Message
          </button>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 hover:scale-[1.02] ${
              isLiked 
                ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-lg' 
                : 'bg-white/70 text-purple-600 border border-purple-200 hover:bg-white'
            }`}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} /> 
            {isLiked ? 'Liked' : 'Like'}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card m-4 p-6 max-w-sm w-full animate-scale-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Share Profile</h3>
            <p className="text-gray-600 mb-4">Share {profile.name}'s profile with others</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:scale-105 transition-all duration-300">
                Copy Link
              </button>
              <button 
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUserProfile;
