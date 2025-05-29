import { supabase } from '../lib/supabase'

// Sample data for FYNC
export const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival 2025',
    description: 'The biggest music festival of the year featuring top artists from around the world.',
    image: '/api/placeholder/400/300',
    date: '2025-07-15T18:00:00Z',
    location: 'Central Park, New York',
    venue: 'Great Lawn',
    price: 125.00,
    genre: 'Mixed',
    lineup: ['Arctic Monkeys', 'Billie Eilish', 'The Weeknd', 'Dua Lipa'],
    attendees_count: 2500
  },
  {
    id: '2',
    title: 'Electronic Beats Night',
    description: 'An unforgettable night of electronic music and dancing.',
    image: '/api/placeholder/400/300',
    date: '2025-06-20T21:00:00Z',
    location: 'Los Angeles, CA',
    venue: 'The Warehouse',
    price: 75.00,
    genre: 'Electronic',
    lineup: ['Calvin Harris', 'Deadmau5', 'Skrillex'],
    attendees_count: 800
  },
  {
    id: '3',
    title: 'Acoustic Sessions',
    description: 'Intimate acoustic performances by rising indie artists.',
    image: '/api/placeholder/400/300',
    date: '2025-06-05T19:30:00Z',
    location: 'Seattle, WA',
    venue: 'Blue Moon Cafe',
    price: 35.00,
    genre: 'Indie',
    lineup: ['Phoebe Bridgers', 'Mac DeMarco', 'Boy Pablo'],
    attendees_count: 150
  },
  {
    id: '4',
    title: 'Rock Revival',
    description: 'Classic rock meets modern edge in this high-energy concert.',
    image: '/api/placeholder/400/300',
    date: '2025-06-30T20:00:00Z',
    location: 'Chicago, IL',
    venue: 'Metro Chicago',
    price: 60.00,
    genre: 'Rock',
    lineup: ['Foo Fighters', 'Royal Blood', 'Greta Van Fleet'],
    attendees_count: 1200
  }
];

export const sampleUsers = [
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    bio: 'Live music enthusiast and festival hopper 🎵',
    profile_image: '/api/placeholder/150/150',
    cover_image: '/api/placeholder/600/200',
    location: 'San Francisco, CA',
    favorite_genres: ['Indie', 'Alternative', 'Electronic'],
    favorite_artists: ['Tame Impala', 'Arctic Monkeys', 'Lorde'],
    concerts_attended: 15,
    memories_count: 12,
    friends_count: 8
  },
  {
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    bio: 'Producer, DJ, and music lover 🎧',
    profile_image: '/api/placeholder/150/150',
    cover_image: '/api/placeholder/600/200',
    location: 'Miami, FL',
    favorite_genres: ['Electronic', 'House', 'Techno'],
    favorite_artists: ['Calvin Harris', 'Deadmau5', 'Swedish House Mafia'],
    concerts_attended: 25,
    memories_count: 18,
    friends_count: 12
  },
  {
    name: 'Emma Thompson',
    email: 'emma@example.com',
    bio: 'Concert photographer and music blogger 📸',
    profile_image: '/api/placeholder/150/150',
    cover_image: '/api/placeholder/600/200',
    location: 'Nashville, TN',
    favorite_genres: ['Country', 'Folk', 'Americana'],
    favorite_artists: ['Kacey Musgraves', 'Chris Stapleton', 'Brandi Carlile'],
    concerts_attended: 30,
    memories_count: 25,
    friends_count: 15
  }
];

export const sampleMemories = [
  {
    caption: 'What an amazing night at the Electronic Beats Festival! 🎵✨',
    image: '/api/placeholder/400/400',
    mood: 'excited',
    event_type: 'festival',
    location: 'Los Angeles, CA',
    likes_count: 15
  },
  {
    caption: 'Front row at the acoustic session - pure magic! 🎸',
    image: '/api/placeholder/400/400',
    mood: 'peaceful',
    event_type: 'concert',
    location: 'Seattle, WA',
    likes_count: 8
  },
  {
    caption: 'Rock revival was INSANE! My ears are still ringing 🤘',
    image: '/api/placeholder/400/400',
    mood: 'energetic',
    event_type: 'concert',
    location: 'Chicago, IL',
    likes_count: 22
  }
];

// Database initialization functions
export class DataService {
  // Initialize sample events
  static async initializeEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(sampleEvents);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error initializing events:', error);
      return { success: false, error };
    }
  }

  // Check if app has sample data
  static async hasSampleData() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking sample data:', error);
      return false;
    }
  }

  // Initialize app with sample data if needed
  static async initializeApp() {
    try {
      const hasData = await this.hasSampleData();
      
      if (!hasData) {
        console.log('Initializing app with sample data...');
        await this.initializeEvents();
        console.log('Sample data initialized successfully');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing app:', error);
      return { success: false, error };
    }
  }
}
