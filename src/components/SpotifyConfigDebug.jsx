import React from 'react'
import { SpotifyService } from '../services/spotifyService'

const SpotifyConfigDebug = () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
  
  const handleTestOAuth = () => {
    const authUrl = SpotifyService.getAuthUrl()
    console.log('🎵 Generated OAuth URL:', authUrl)
    
    // Open in new tab so we can see any errors
    window.open(authUrl, '_blank')
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '15px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '350px'
    }}>
      <h4>🔍 Spotify OAuth Debug</h4>
      <div><strong>Client ID:</strong> {clientId || 'NOT LOADED'}</div>
      <div><strong>Redirect URI:</strong> {redirectUri || 'NOT LOADED'}</div>
      <div><strong>Current Origin:</strong> {window.location.origin}</div>
      <div><strong>Current Protocol:</strong> {window.location.protocol}</div>
      
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={handleTestOAuth}
          style={{
            background: '#1db954',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🧪 Test OAuth URL
        </button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <strong>Expected in Spotify app:</strong><br/>
        https://localhost:5174/auth/spotify/callback
      </div>
    </div>
  )
}

export default SpotifyConfigDebug
