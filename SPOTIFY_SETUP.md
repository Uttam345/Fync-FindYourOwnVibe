# Spotify Integration Setup Guide

This guide will help you set up Spotify Web API integration for the FYNC music social app.

## Prerequisites

- A Spotify account (free or premium)
- Access to [Spotify for Developers](https://developer.spotify.com/)

## Setup Steps

### 1. Create a Spotify App

1. Go to [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app details:
   - **App Name**: FYNC Music Social App
   - **App Description**: A social app that connects music lovers based on their taste   - **Website**: `https://localhost:5173` (for development)
   - **Redirect URI**: `https://localhost:5173/auth/spotify/callback`
5. Accept the terms and create the app

### 2. Get Your Credentials

1. Once your app is created, you'll see the app dashboard
2. Copy the **Client ID** 
3. Click "Show Client Secret" and copy the **Client Secret**

### 3. Configure Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values:

```env
# Replace 'your-spotify-client-id-here' with your actual Client ID
VITE_SPOTIFY_CLIENT_ID=your-actual-client-id-here

# The redirect URI should match what you set in Spotify dashboard
VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/auth/spotify/callback
```

### 4. Update Spotify App Settings

1. In your Spotify app dashboard, go to "Settings"
2. Add the following redirect URIs:
   - `https://localhost:5173/auth/spotify/callback` (for development)
   - `https://yourdomain.com/auth/spotify/callback` (for production)

## How It Works

1. **User clicks "Connect with Spotify"** → App redirects to Spotify authorization
2. **User authorizes the app** → Spotify redirects back with authorization code
3. **App exchanges code for access token** → App fetches user's music data
4. **User's music preferences are updated** → App shows personalized recommendations

## Scopes Used

The app requests the following Spotify scopes:
- `user-read-private` - Access user's basic profile info
- `user-read-email` - Access user's email address
- `user-top-read` - Access user's top artists and tracks
- `user-library-read` - Access user's saved tracks/albums
- `user-follow-read` - Access user's followed artists
- `playlist-read-private` - Access user's private playlists
- `user-read-recently-played` - Access user's recently played tracks

## HTTPS Development Setup

⚠️ **IMPORTANT**: Spotify OAuth requires HTTPS for security. Before testing, you need to set up HTTPS in your development environment.

**Quick Setup Options:**
1. **Use mkcert (Recommended)** - See `HTTPS_DEVELOPMENT_SETUP.md` for detailed instructions
2. **Use ngrok** - Create a secure tunnel to your local server
3. **Use cloud development** - GitHub Codespaces, Gitpod, etc.

📋 **See the complete guide**: `HTTPS_DEVELOPMENT_SETUP.md`

## Testing

1. **Set up HTTPS first** (see above section)
2. Start the development server: `npm run dev`
3. Go to the onboarding flow (step 2)
4. Click "Connect with Spotify"
5. You should be redirected to Spotify for authorization
6. After authorization, you'll be redirected back with music data

## Production Deployment

For production deployment:

1. Update your Spotify app settings with your production domain
2. Add production redirect URI to your Spotify app
3. Update the `VITE_SPOTIFY_REDIRECT_URI` environment variable

## Troubleshooting

### "Invalid client" error
- Check that your Client ID is correct in the `.env` file
- Make sure the redirect URI in Spotify dashboard matches exactly

### "Invalid redirect URI" error
- Check that the redirect URI is added to your Spotify app settings
- Ensure the URI matches exactly (including http/https and trailing slashes)

### "Invalid scope" error
- The scopes in the code are standard and should work
- Check Spotify documentation for any scope changes

## API Rate Limits

Spotify API has rate limits:
- **Regular endpoints**: 100 requests per minute
- **Search endpoints**: 100 requests per minute
- **Token refresh**: No specific limit mentioned

The app is designed to minimize API calls by caching user data locally.

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

### Development Environment Security
- **HTTPS Required**: Spotify OAuth requires HTTPS for security
- **Local HTTPS Setup**: You need to configure your dev server for HTTPS

### Secure Development Options:

#### Option 1: Use Vite with HTTPS (Recommended)
1. Install mkcert for local HTTPS certificates:
```bash
# Install mkcert (Windows with Chocolatey)
choco install mkcert

# Or download from: https://github.com/FiloSottile/mkcert/releases
```

2. Create local certificates:
```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

3. Update your `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    port: 5173,
    host: 'localhost'
  }
})
```

#### Option 2: Use ngrok for Secure Tunneling
1. Install ngrok: https://ngrok.com/download
2. Start your dev server: `npm run dev`
3. In another terminal: `ngrok http 5173`
4. Use the HTTPS URL from ngrok as your redirect URI

#### Option 3: Use Production-like Environment
Deploy to a staging environment with proper HTTPS:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- Railway, Render, or similar platforms

### Production Security Requirements
- **Always use HTTPS** in production
- **Validate redirect URIs** server-side
- **Implement CSRF protection** with state parameter
- **Store tokens securely** (encrypted, httpOnly cookies)
- **Never expose Client Secret** in frontend code
- **Implement token refresh** logic for long-lived sessions
- **Use secure headers** (HSTS, CSP, etc.)

### Environment Variables Security
```env
# ✅ SECURE - HTTPS redirect URI
VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/auth/spotify/callback

# ✅ SECURE - Client ID (safe to expose in frontend)
VITE_SPOTIFY_CLIENT_ID=your-actual-client-id-here

# ❌ NEVER expose Client Secret in frontend
# CLIENT_SECRET=your-secret-here  # DON'T DO THIS
```

### Token Security Best Practices
- Store access tokens in memory (not localStorage)
- Use httpOnly cookies for refresh tokens
- Implement automatic token refresh
- Clear tokens on logout
- Set appropriate token expiration times

### Additional Security Measures
- Implement rate limiting
- Add request validation
- Use CORS properly
- Monitor for suspicious activity
- Regular security audits

- Never expose your Client Secret in frontend code
- In production, token exchange should happen on your backend server
- Consider implementing token refresh logic for long-lived sessions
- Store sensitive data securely (use encrypted storage for tokens)

## Need Help?

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/)
- Check the console for detailed error messages during development
