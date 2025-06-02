# FYNC - Find Your Own Vibe

FYNC is a modern social app that connects vibe seekers based on their shared taste in artists, events, and musical experiences. Built with React and powered by Supabase.

## Features

- 🎵 **Music-Based Matching**: Connect with people who share your music taste
- 🎪 **Event Discovery**: Find and attend music events together
- 💬 **Real-time Chat**: Connect and chat with your music matches
- 📱 **Mobile-First Design**: Beautiful, responsive interface optimized for mobile
- 🎨 **Modern UI**: Glassmorphism design with smooth animations

## Tech Stack

- **Frontend**: React 19, Vite, Framer Motion
- **Backend**: Supabase (Authentication, Database, Real-time)
- **Styling**: Custom CSS with Tailwind-inspired utilities
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (for backend services)
- A Spotify Developer account (for music integration)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd musicmingle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env`

4. **Set up Spotify Integration (Optional but Recommended)**
   - Follow the complete guide in `SPOTIFY_SETUP.md`
   - Set up HTTPS for development (see `HTTPS_DEVELOPMENT_SETUP.md`)
   - Add your Spotify credentials to `.env`

5. **Configure Environment Variables**
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
   VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/auth/spotify/callback
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### HTTPS Development Setup (Required for Spotify)

The Spotify OAuth integration requires HTTPS. Choose one of these methods:

- **Method 1 (Recommended)**: Use mkcert for local HTTPS certificates
- **Method 2**: Use ngrok for secure tunneling  
- **Method 3**: Use cloud development environments

📋 **See complete instructions**: `HTTPS_DEVELOPMENT_SETUP.md`

### Documentation

- 📖 **Spotify Setup**: `SPOTIFY_SETUP.md` - Complete Spotify integration guide
- 🔒 **HTTPS Setup**: `HTTPS_DEVELOPMENT_SETUP.md` - Local HTTPS development
- 🎵 **Implementation Details**: `SPOTIFY_IMPLEMENTATION.md` - Technical overview

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.te

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
