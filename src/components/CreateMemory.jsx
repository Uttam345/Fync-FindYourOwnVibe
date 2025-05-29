import React, { useState } from 'react';
import { Camera, X, ChevronLeft, MapPin, Users, Music, Smile, Image, Video, Mic } from 'lucide-react';

const CreateMemory = ({ navigate }) => {
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState([]);
  const [mood, setMood] = useState('');
  const [eventType, setEventType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const connections = [
    { id: 101, name: 'Emma Wilson', image: '/api/placeholder/40/40' },
    { id: 102, name: 'Liam Parker', image: '/api/placeholder/40/40' },
    { id: 103, name: 'Sophia Chen', image: '/api/placeholder/40/40' },
    { id: 104, name: 'Jake Miller', image: '/api/placeholder/40/40' },
    { id: 105, name: 'Maya Patel', image: '/api/placeholder/40/40' }
  ];

  const moods = [
    { id: 'euphoric', label: 'Euphoric', emoji: '😍', color: 'from-purple-400 to-pink-400' },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: 'from-orange-400 to-red-400' },
    { id: 'blissful', label: 'Blissful', emoji: '😌', color: 'from-blue-400 to-indigo-400' },
    { id: 'nostalgic', label: 'Nostalgic', emoji: '🥺', color: 'from-amber-400 to-orange-400' },
    { id: 'amazed', label: 'Amazed', emoji: '🤯', color: 'from-green-400 to-teal-400' }
  ];

  const eventTypes = [
    { id: 'concert', label: 'Concert', icon: Music },
    { id: 'festival', label: 'Festival', icon: Users },
    { id: 'backstage', label: 'Backstage', icon: Camera },
    { id: 'rehearsal', label: 'Rehearsal', icon: Mic }
  ];

  const commonEmojis = ['🎵', '🎶', '🎤', '🎸', '🥁', '🎹', '🎺', '🎻', '🔥', '💯', '✨', '🌟', '❤️', '😍', '🤩', '🙌'];

  const togglePerson = (person) => {
    if (people.some(p => p.id === person.id)) {
      setPeople(people.filter(p => p.id !== person.id));
    } else {
      setPeople([...people, person]);
    }
  };

  const handleAddPhoto = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setImagePreview('/api/placeholder/400/300');
      setIsUploading(false);
    }, 1500);
  };

  const handleCreateMemory = () => {
    // Add loading state and navigate back
    navigate('memories');
  };

  const addEmoji = (emoji) => {
    setCaption(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-10 border-b border-white/20">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('memories')}
              className="mr-3 p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} className="text-purple-700" />
            </button>
            <div className="flex items-center space-x-2">
              <Camera className="text-purple-600" size={22} />
              <h1 className="font-bold text-gray-800 text-lg">Create Memory</h1>
            </div>
          </div>
          <button
            onClick={handleCreateMemory}
            disabled={!imagePreview || !caption}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              !imagePreview || !caption
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-105 shadow-lg'
            }`}
          >
            Post
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Photo Upload Section */}
        <div className="glass-card p-4">
          {!imagePreview ? (
            <div className="space-y-4">
              <button
                onClick={handleAddPhoto}
                disabled={isUploading}
                className="w-full h-48 border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 group"
              >
                {isUploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    <p className="text-purple-600 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Camera size={40} className="text-purple-400 mb-3 group-hover:scale-110 transition-all duration-300" />
                    <p className="text-purple-600 font-medium">Add Photo or Video</p>
                    <p className="text-gray-500 text-sm mt-1">Share your music moment</p>
                  </>
                )}
              </button>
              
              {/* Media Options */}
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <Image className="text-purple-600 mb-1" size={20} />
                  <span className="text-xs text-gray-600">Photo</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <Video className="text-purple-600 mb-1" size={20} />
                  <span className="text-xs text-gray-600">Video</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <Camera className="text-purple-600 mb-1" size={20} />
                  <span className="text-xs text-gray-600">Camera</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Memory preview"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                Photo
              </div>
            </div>
          )}
        </div>        {/* Caption Section */}
        <div className="glass-card p-4">
          <label className="flex items-center text-gray-700 font-medium mb-3">
            <Music className="mr-2 text-purple-600" size={18} />
            Caption
          </label>
          <div className="relative">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 resize-none bg-white/70"
              rows={4}
              placeholder="Share your music moment... What made it special?"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute bottom-3 right-3 p-1 text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300"
            >
              <Smile size={20} />
            </button>
          </div>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-purple-200">
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="p-2 hover:bg-purple-50 rounded-lg transition-all duration-300 hover:scale-110 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Type */}        <div className="glass-card p-4">
          <label className="flex items-center text-gray-700 font-medium mb-3">
            <Music className="mr-2 text-purple-600" size={18} />
            Event Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {eventTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setEventType(id)}
                className={`p-3 rounded-lg border transition-all duration-300 flex items-center justify-center space-x-2 ${
                  eventType === id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-lg'
                    : 'bg-white/50 text-gray-600 border-purple-200 hover:bg-white/70'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>        {/* Mood Selection */}
        <div className="glass-card p-4">
          <label className="flex items-center text-gray-700 font-medium mb-3">
            <Smile className="mr-2 text-purple-600" size={18} />
            How are you feeling?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {moods.map(({ id, label, emoji, color }) => (
              <button
                key={id}
                onClick={() => setMood(id)}
                className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
                  mood === id
                    ? `bg-gradient-to-r ${color} text-white border-transparent shadow-lg`
                    : 'bg-white/50 text-gray-600 border-purple-200 hover:bg-white/70'
                }`}
              >
                <div className="text-lg mb-1">{emoji}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>        {/* Location */}
        <div className="glass-card p-4">
          <label className="flex items-center text-gray-700 font-medium mb-3">
            <MapPin className="mr-2 text-purple-600" size={18} />
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 bg-white/70"
            placeholder="Where was this taken?"
          />
        </div>        {/* Tag Friends */}
        <div className="glass-card p-4">
          <label className="flex items-center text-gray-700 font-medium mb-3">
            <Users className="mr-2 text-purple-600" size={18} />
            Tag Friends ({people.length} selected)
          </label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {connections.map(connection => (
              <div
                key={connection.id}
                className="flex items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300"
              >
                <img
                  src={connection.image}
                  alt={connection.name}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-purple-200"
                />
                <span className="font-medium text-gray-700 flex-1">{connection.name}</span>
                <button
                  onClick={() => togglePerson(connection)}
                  className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                    people.some(p => p.id === connection.id)
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-110'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {people.some(p => p.id === connection.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Friends Preview */}
        {people.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="font-medium text-gray-700 mb-3">Tagged Friends</h3>
            <div className="flex flex-wrap gap-2">
              {people.map(person => (
                <div key={person.id} className="flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  <span>{person.name}</span>
                  <button
                    onClick={() => togglePerson(person)}
                    className="ml-2 hover:scale-110 transition-all duration-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Create Button */}
      <div className="fixed bottom-16 inset-x-0 p-4 bg-gradient-to-t from-white to-transparent">
        <button
          onClick={handleCreateMemory}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            !imagePreview || !caption
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
          }`}
          disabled={!imagePreview || !caption}
        >
          Create Memory ✨
        </button>
      </div>
    </div>
  );
};

export default CreateMemory;
