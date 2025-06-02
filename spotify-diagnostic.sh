#!/bin/bash
# Comprehensive Spotify OAuth Diagnostic

echo "🔍 SPOTIFY OAUTH DIAGNOSTIC"
echo "=========================="
echo ""

# Check current environment
echo "📍 Current Environment:"
echo "  Current directory: $(pwd)"
echo "  Current URL would be: https://localhost:5174"
echo ""

# Check .env file
echo "📋 Environment Variables:"
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    
    if grep -q "VITE_SPOTIFY_CLIENT_ID=423d596237724235a4fbbed742318be8" .env; then
        echo "  ✅ Client ID matches expected value"
    else
        echo "  ❌ Client ID mismatch or missing"
        echo "     Expected: 423d596237724235a4fbbed742318be8"
        echo "     Found: $(grep VITE_SPOTIFY_CLIENT_ID .env || echo 'NOT FOUND')"
    fi
    
    if grep -q "VITE_SPOTIFY_REDIRECT_URI=https://localhost:5174/auth/spotify/callback" .env; then
        echo "  ✅ Redirect URI matches expected value"
    else
        echo "  ❌ Redirect URI mismatch"
        echo "     Expected: https://localhost:5174/auth/spotify/callback"
        echo "     Found: $(grep VITE_SPOTIFY_REDIRECT_URI .env || echo 'NOT FOUND')"
    fi
else
    echo "  ❌ .env file not found"
fi

echo ""

# Check HTTPS certificates
echo "🔒 HTTPS Setup:"
if [ -f "localhost+2.pem" ] && [ -f "localhost+2-key.pem" ]; then
    echo "  ✅ HTTPS certificates found"
    echo "     - Certificate: localhost+2.pem"
    echo "     - Private key: localhost+2-key.pem"
else
    echo "  ❌ HTTPS certificates missing"
fi

echo ""

# Check if server is running
echo "🚀 Development Server:"
if netstat -an 2>/dev/null | grep -q ":5174" || ss -tuln 2>/dev/null | grep -q ":5174"; then
    echo "  ✅ Server appears to be running on port 5174"
else
    echo "  ❌ Server not detected on port 5174"
fi

echo ""

# Test OAuth URL construction
echo "🔗 OAuth URL Test:"
CLIENT_ID="423d596237724235a4fbbed742318be8"
REDIRECT_URI="https://localhost:5174/auth/spotify/callback"
SCOPES="user-read-private user-read-email user-top-read user-library-read user-follow-read playlist-read-private user-read-recently-played"
STATE=$(openssl rand -hex 8 2>/dev/null || echo "randomstate123")

OAUTH_URL="https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES// /%20}&state=${STATE}&show_dialog=true"

echo "  Generated OAuth URL:"
echo "  $OAUTH_URL"
echo ""

# Test if the URL is accessible
echo "🌐 Connectivity Test:"
if curl -s --max-time 5 "https://accounts.spotify.com" >/dev/null; then
    echo "  ✅ Can reach Spotify's authorization server"
else
    echo "  ❌ Cannot reach Spotify's authorization server"
fi

echo ""

# Common issues checklist
echo "❓ Common Issues Checklist:"
echo "  1. Redirect URI in Spotify app EXACTLY matches: https://localhost:5174/auth/spotify/callback"
echo "  2. No trailing slashes or extra characters"
echo "  3. HTTPS is working (you should see a lock icon in browser)"
echo "  4. Client ID is correct: 423d596237724235a4fbbed742318be8"
echo "  5. Spotify app is not in development mode restrictions"
echo ""

echo "🎯 Next Steps:"
echo "  1. Verify your Spotify app settings at: https://developer.spotify.com/dashboard"
echo "  2. Make sure redirect URI is EXACTLY: https://localhost:5174/auth/spotify/callback"
echo "  3. Test the OAuth URL above manually in your browser"
echo "  4. Check browser console for any JavaScript errors"
echo ""

echo "🧪 Manual Test:"
echo "  Copy this URL and paste it in your browser:"
echo "  $OAUTH_URL"
echo ""
echo "  Expected behavior:"
echo "  - Should redirect to Spotify login"
echo "  - After login, should redirect back to your app"
echo "  - Should NOT show 'INVALID_CLIENT' error"
