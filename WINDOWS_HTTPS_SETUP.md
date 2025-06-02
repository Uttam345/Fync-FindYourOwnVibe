# Quick HTTPS Setup for Windows

Since mkcert is not installed, here are the quickest ways to get HTTPS working:

## Option 1: Install mkcert (Recommended for long-term development)

### Using Chocolatey (if you have it):
```bash
choco install mkcert
```

### Using Scoop (if you have it):
```bash
scoop bucket add extras
scoop install mkcert
```

### Manual Installation:
1. Download from: https://github.com/FiloSottile/mkcert/releases
2. Download `mkcert-v1.4.4-windows-amd64.exe`
3. Rename to `mkcert.exe`
4. Add to your PATH or place in your project folder

### After installing mkcert:
```bash
# Install local CA
mkcert -install

# Generate certificates for localhost
mkcert localhost 127.0.0.1 ::1

# Start the dev server (it will auto-detect HTTPS certificates)
npm run dev
```

## Option 2: Use ngrok (Quick testing)

1. Download ngrok from: https://ngrok.com/download
2. Start your regular dev server:
   ```bash
   npm run dev
   ```
3. In another terminal:
   ```bash
   ngrok http 5174
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update your `.env` file:
   ```env
   VITE_SPOTIFY_REDIRECT_URI=https://abc123.ngrok.io/auth/spotify/callback
   ```
6. Update your Spotify app settings with the ngrok URL

## Option 3: Use GitHub Codespaces or Gitpod

Both provide HTTPS by default - no local setup needed!

## Current Status

✅ Your Spotify Client ID is configured
✅ Your code is ready for HTTPS
✅ Dev server is running on http://localhost:5174

❌ HTTPS certificates needed for Spotify OAuth
❌ Port changed to 5174 (update redirect URI if using fixed port)

## Next Steps

1. Choose one of the options above
2. Set up HTTPS
3. Test the Spotify integration in the onboarding flow
4. Enjoy your music-based social app! 🎵
