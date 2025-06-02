# HTTPS Development Setup Guide

Since Spotify OAuth requires HTTPS for security, you need to configure your local development environment to use HTTPS. Here are several methods to achieve this:

## Method 1: Vite with mkcert (Recommended)

### Step 1: Install mkcert

**Windows (with Chocolatey):**
```bash
choco install mkcert
```

**Windows (Manual Download):**
1. Download from [mkcert releases](https://github.com/FiloSottile/mkcert/releases)
2. Extract and add to your PATH

**macOS:**
```bash
brew install mkcert
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-v*-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

### Step 2: Create Local CA and Certificates

```bash
# Install the local CA in the system trust store
mkcert -install

# Create certificates for localhost
mkcert localhost 127.0.0.1 ::1
```

This will create two files:
- `localhost+2.pem` (certificate)
- `localhost+2-key.pem` (private key)

### Step 3: Update Vite Configuration

Create or update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
    },
    port: 5173,
    host: 'localhost'
  }
})
```

### Step 4: Start Development Server

```bash
npm run dev
```

Your app will now be available at `https://localhost:5173` with a valid SSL certificate!

## Method 2: Using ngrok (Alternative)

If you prefer not to modify your local setup:

### Step 1: Install ngrok
1. Download from [ngrok.com](https://ngrok.com/download)
2. Sign up for a free account
3. Install and authenticate ngrok

### Step 2: Start Your Dev Server
```bash
npm run dev
```

### Step 3: Create Secure Tunnel
```bash
ngrok http 5173
```

### Step 4: Update Environment Variables
Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) and update your `.env`:

```env
VITE_SPOTIFY_REDIRECT_URI=https://abc123.ngrok.io/auth/spotify/callback
```

### Step 5: Update Spotify App Settings
Add the ngrok URL to your Spotify app's redirect URIs in the developer dashboard.

## Method 3: Using Local Tunnel Services

### Cloudflare Tunnel (Free)
```bash
# Install cloudflared
# Then run:
cloudflared tunnel --url http://localhost:5173
```

### LocalTunnel
```bash
npx localtunnel --port 5173 --subdomain your-app-name
```

## Method 4: Development on a Cloud Environment

### Option A: GitHub Codespaces
1. Open your repository in GitHub Codespaces
2. The environment automatically provides HTTPS URLs
3. Update your Spotify app redirect URI to the Codespaces URL

### Option B: Gitpod
1. Open your repository in Gitpod
2. Similar to Codespaces, provides HTTPS by default

## Method 5: Local Development Server with Proxy

### Using Caddy Server
Create a `Caddyfile`:

```
localhost:5174 {
    reverse_proxy localhost:5173
}
```

Then run:
```bash
caddy run
```

## Testing Your HTTPS Setup

1. Visit `https://localhost:5173` (or your HTTPS URL)
2. Ensure there's no certificate warning
3. Check that the lock icon appears in your browser
4. Test the Spotify OAuth flow

## Troubleshooting

### Certificate Warnings
- Make sure you ran `mkcert -install`
- Restart your browser after installing certificates
- Check that certificate files exist and are readable

### Port Conflicts
- If port 5173 is busy, update both your vite config and Spotify redirect URI
- Use `netstat -an | findstr :5173` to check port usage

### Spotify Redirect URI Mismatch
- Ensure the URI in Spotify dashboard exactly matches your development URL
- Include/exclude trailing slashes consistently
- Check http vs https carefully

### Firefox Issues
- Firefox may require additional setup for self-signed certificates
- Go to `about:config` and set `security.tls.insecure_fallback_hosts` if needed

## Production Considerations

When deploying to production:

1. **Use Real SSL Certificates**: Use Let's Encrypt, Cloudflare, or your hosting provider's SSL
2. **Update Redirect URIs**: Add production URLs to Spotify app settings
3. **Environment Variables**: Update production environment with proper HTTPS URLs
4. **Security Headers**: Implement proper HSTS, CSP, and other security headers

## Security Benefits of HTTPS

- **Protects OAuth Flow**: Prevents interception of authorization codes
- **Data Encryption**: All communication between browser and server is encrypted
- **Trust Indicators**: Browser shows security indicators to users
- **Prevents MITM**: Man-in-the-middle attacks are prevented
- **Required by APIs**: Many modern APIs require HTTPS for security

## Choose Your Method

**For Regular Development**: Method 1 (mkcert) - Set it up once, use everywhere
**For Quick Testing**: Method 2 (ngrok) - No local configuration needed
**For Cloud Development**: Method 4 - Built-in HTTPS support
**For Team Development**: Method 2 or 4 - Easy sharing of development URLs

Once you have HTTPS working, your Spotify OAuth integration will work seamlessly!
