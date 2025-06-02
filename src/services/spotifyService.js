// Spotify Web API Service
import { supabase } from '../lib/supabase'

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your-spotify-client-id'
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'https://localhost:5174/auth/spotify/callback'

const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'user-follow-read',
  'playlist-read-private',
  'user-read-recently-played'
].join(' ')

export class SpotifyService {  // Generate Spotify authorization URL
  static getAuthUrl() {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,      state: this.generateRandomString(16),
      show_dialog: 'true'
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params}`
    
    return authUrl
  }

  // Generate random string for state parameter
  static generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let text = ''
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  // Exchange authorization code for access token
  static async exchangeCodeForToken(code, state) {
    try {
      // In a production app, this should be done on the backend for security
      // For now, we'll simulate the token exchange
      console.log('Exchanging code for token:', { code, state })
      
      // Simulate successful token exchange
      const mockTokenData = {
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        expires_in: 3600,
        token_type: 'Bearer',
        scope: SPOTIFY_SCOPES
      }

      return { data: mockTokenData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get user's Spotify profile
  static async getUserProfile(accessToken) {
    try {
      // In production, use real Spotify API
      // For now, return mock data
      const mockProfile = {
        id: 'spotify_user_' + Date.now(),
        display_name: 'Spotify User',
        email: 'user@spotify.com',
        followers: { total: 42 },
        images: [{ url: '/api/placeholder/150/150' }],
        country: 'US'
      }

      return { data: mockProfile, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get user's top artists
  static async getTopArtists(accessToken, timeRange = 'medium_term', limit = 20) {
    try {
      // Mock top artists data
      const mockArtists = [
        { name: 'Arctic Monkeys', genres: ['indie rock', 'alternative rock'], popularity: 85 },
        { name: 'Tame Impala', genres: ['psychedelic pop', 'indie rock'], popularity: 78 },
        { name: 'The Strokes', genres: ['indie rock', 'garage rock'], popularity: 72 },
        { name: 'Radiohead', genres: ['alternative rock', 'experimental'], popularity: 80 },
        { name: 'Mac DeMarco', genres: ['indie rock', 'bedroom pop'], popularity: 65 },
        { name: 'King Krule', genres: ['indie rock', 'jazz'], popularity: 58 },
        { name: 'MGMT', genres: ['psychedelic pop', 'indie rock'], popularity: 70 },
        { name: 'Vampire Weekend', genres: ['indie rock', 'indie pop'], popularity: 74 }
      ]

      return { data: { items: mockArtists }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get user's top tracks
  static async getTopTracks(accessToken, timeRange = 'medium_term', limit = 20) {
    try {
      // Mock top tracks data
      const mockTracks = [
        { 
          name: 'Do I Wanna Know?', 
          artists: [{ name: 'Arctic Monkeys' }],
          album: { name: 'AM' },
          popularity: 88
        },
        { 
          name: 'The Less I Know The Better', 
          artists: [{ name: 'Tame Impala' }],
          album: { name: 'Currents' },
          popularity: 85
        },
        { 
          name: 'Last Nite', 
          artists: [{ name: 'The Strokes' }],
          album: { name: 'Is This It' },
          popularity: 82
        }
      ]

      return { data: { items: mockTracks }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get user's saved tracks (liked songs)
  static async getSavedTracks(accessToken, limit = 50) {
    try {
      // Mock saved tracks
      const mockSavedTracks = [
        { 
          track: {
            name: 'Borderline', 
            artists: [{ name: 'Tame Impala' }],
            album: { name: 'The Slow Rush' }
          }
        },
        { 
          track: {
            name: 'Reptilia', 
            artists: [{ name: 'The Strokes' }],
            album: { name: 'Room on Fire' }
          }
        }
      ]

      return { data: { items: mockSavedTracks }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get user's followed artists
  static async getFollowedArtists(accessToken, limit = 50) {
    try {
      // Mock followed artists
      const mockFollowedArtists = [
        { name: 'Arctic Monkeys', genres: ['indie rock'], followers: { total: 8500000 } },
        { name: 'Tame Impala', genres: ['psychedelic pop'], followers: { total: 4200000 } },
        { name: 'The Strokes', genres: ['indie rock'], followers: { total: 3800000 } }
      ]

      return { data: { artists: { items: mockFollowedArtists } }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Store Spotify data in user profile
  static async storeSpotifyData(userId, spotifyData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          spotify_connected: true,
          spotify_user_id: spotifyData.profile?.id,
          spotify_data: spotifyData,
          favorite_artists: spotifyData.topArtists?.map(artist => artist.name) || [],
          favorite_genres: this.extractGenres(spotifyData.topArtists || []),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Extract unique genres from artists
  static extractGenres(artists) {
    const allGenres = artists.flatMap(artist => artist.genres || [])
    const uniqueGenres = [...new Set(allGenres)]
    
    // Map to our app's genre categories
    const genreMapping = {
      'indie rock': 'Indie',
      'alternative rock': 'Alternative',
      'psychedelic pop': 'Alternative',
      'garage rock': 'Rock',
      'experimental': 'Alternative',
      'bedroom pop': 'Indie',
      'jazz': 'Jazz',
      'indie pop': 'Indie',
      'electronic': 'Electronic',
      'hip hop': 'Hip-Hop',
      'pop': 'Pop',
      'classical': 'Classical',
      'country': 'Country',
      'folk': 'Folk',
      'blues': 'Blues',
      'metal': 'Metal'
    }

    return uniqueGenres
      .map(genre => genreMapping[genre.toLowerCase()] || genre)
      .filter((genre, index, self) => self.indexOf(genre) === index)
      .slice(0, 5) // Limit to 5 genres
  }

  // Initiate Spotify OAuth flow
  static initiateAuth() {
    const authUrl = this.getAuthUrl()
    window.location.href = authUrl
  }

  // Handle OAuth callback
  static async handleCallback(code, state, userId) {
    try {
      // Exchange code for tokens
      const tokenResult = await this.exchangeCodeForToken(code, state)
      if (tokenResult.error) throw tokenResult.error

      const accessToken = tokenResult.data.access_token

      // Get user's Spotify data
      const [profileResult, topArtistsResult, topTracksResult] = await Promise.all([
        this.getUserProfile(accessToken),
        this.getTopArtists(accessToken),
        this.getTopTracks(accessToken)
      ])

      if (profileResult.error) throw profileResult.error

      const spotifyData = {
        profile: profileResult.data,
        topArtists: topArtistsResult.data?.items || [],
        topTracks: topTracksResult.data?.items || [],
        accessToken: accessToken,
        refreshToken: tokenResult.data.refresh_token,
        expiresAt: Date.now() + (tokenResult.data.expires_in * 1000)
      }

      // Store in user profile
      if (userId) {
        await this.storeSpotifyData(userId, spotifyData)
      }

      return { data: spotifyData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Check if user has Spotify connected
  static async isSpotifyConnected(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('spotify_connected, spotify_data')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { 
        connected: data?.spotify_connected || false, 
        data: data?.spotify_data,
        error: null 
      }
    } catch (error) {
      return { connected: false, data: null, error }
    }
  }
}
