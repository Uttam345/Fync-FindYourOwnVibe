import React, { useState, useEffect } from 'react';
import { UserCircle, Calendar, MessageSquare, Compass, Settings, Music, LogOut, Heart, X, MapPin, Bell, Users } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import OnboardingProcess from './components/OnboardingProcess';
import SpotifyCallback from './components/SpotifyCallback';
import MainAppLayout from './components/MainAppLayout';
import DiscoverTab from './components/DiscoverTab';
import EventsTab from './components/EventsTab';
import EventDetails from './components/EventDetails';
import EventChat from './components/EventChat';
import ChatsTab from './components/ChatsTab';
import ChatInterface from './components/ChatInterface';
import ProfileTab from './components/ProfileTab';
import EditProfile from './components/EditProfile';
import ViewConnections from './components/ViewConnections';
import SharedMemories from './components/SharedMemories';
import CreateMemory from './components/CreateMemory';
import ViewUserProfile from './components/ViewUserProfile';
import { AuthService } from './services/authService';
import LoadingSpinner from './components/LoadingSpinner';
import SupabaseTestComponent from './components/SupabaseTestComponent';

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(2);
  const [currentView, setCurrentView] = useState('discover');
  const [currentParams, setCurrentParams] = useState({});
  const [loading, setLoading] = useState(true);
  const [spotifyCallbackData, setSpotifyCallbackData] = useState(null);

  // Check for Spotify OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if ((code && state) || error) {
      // This is a Spotify OAuth callback
      setCurrentView('spotify-callback');
      return;
    }
    
    checkAuthStatus();
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    if (currentView !== 'spotify-callback') {
      checkAuthStatus();
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await AuthService.getCurrentUser();
        if (userData) {
          setUser(userData.user);
          setProfile(userData.profile);
          setIsAuthenticated(true);
          setIsFirstTimeUser(false);
          setCurrentView('discover');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setCurrentView('login');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔄 Checking authentication status...');
      
      const { data } = await AuthService.getCurrentUser();
      
      if (data) {
        setUser(data.user);
        setProfile(data.profile);
        setIsAuthenticated(true);
        setIsFirstTimeUser(false);
        setCurrentView('discover');
      } else {
        setCurrentView('login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setCurrentView('login');
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await AuthService.signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      setUser(data.user);
      setProfile(data.profile);
      setIsAuthenticated(true);
      setCurrentView('discover');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setCurrentView('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Complete onboarding
  const completeOnboarding = async (userData) => {
    try {
      setLoading(true);
      console.log('Starting onboarding completion with data:', userData);
      
      const { data, error } = await AuthService.signUp(
        userData.email, 
        userData.password, 
        userData
      );
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (!data || !data.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('Signup successful, setting up user session...');
      
      // Set up the user session
      setUser(data.user);
      setProfile(data.profile || userData); // Use the created profile or fallback to userData
      setIsAuthenticated(true);
      setIsFirstTimeUser(false);
      setCurrentView('discover');
      
      console.log('Onboarding completed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Onboarding failed:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Handle Spotify callback completion
  const handleSpotifyCallbackComplete = (spotifyData) => {
    setSpotifyCallbackData(spotifyData);
    
    if (isAuthenticated) {
      // User is already authenticated, go back to profile or onboarding
      setCurrentView(isFirstTimeUser ? 'onboarding' : 'profile');
    } else {
      // User is in onboarding flow, go back to onboarding
      setCurrentView('onboarding');
    }
  };

  // Navigation handler
  const navigate = (view, params = {}) => {
    setCurrentView(view);
    setCurrentParams(params);
    // Scroll to top when changing views
    window.scrollTo(0, 0);
  };

  // Render the current view based on authentication state
  const renderCurrentView = () => {
    // Handle Spotify OAuth callback
    if (currentView === 'spotify-callback') {
      return (
        <SpotifyCallback 
          onComplete={handleSpotifyCallbackComplete}
          userId={user?.id}
        />
      );
    }

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      if (isFirstTimeUser && currentView === 'onboarding') {
        return <OnboardingProcess onComplete={completeOnboarding} spotifyData={spotifyCallbackData} />;
      }
      return <LoginScreen onLogin={handleLogin} onNavigate={navigate} />;
    }

    // Protected routes
    return (
      <MainAppLayout 
        user={user} 
        profile={profile}
        onLogout={handleLogout} 
        notificationCount={notificationCount}
        currentView={currentView}
        navigate={navigate}
      >
        {currentView === 'discover' && <DiscoverTab navigate={navigate} user={user} />}
        {currentView === 'events' && <EventsTab navigate={navigate} user={user} />}
        {currentView === 'event-details' && <EventDetails navigate={navigate} eventId={currentParams.eventId} />}
        {currentView === 'event-chat' && <EventChat navigate={navigate} eventId={currentParams.eventId} />}
        {currentView === 'chats' && <ChatsTab navigate={navigate} user={user} />}
        {currentView === 'chat' && <ChatInterface navigate={navigate} chatId={currentParams.chatId} user={user} />}
        {currentView === 'profile' && <ProfileTab navigate={navigate} user={user} profile={profile} />}
        {currentView === 'edit-profile' && <EditProfile navigate={navigate} user={user} profile={profile} />}
        {currentView === 'connections' && <ViewConnections navigate={navigate} user={user} />}
        {currentView === 'memories' && <SharedMemories navigate={navigate} user={user} />}
        {currentView === 'create-memory' && <CreateMemory navigate={navigate} user={user} />}
        {currentView === 'user-profile' && <ViewUserProfile navigate={navigate} userId={currentParams.userId} currentUser={user} />}
      </MainAppLayout>
    );
  };

  return (
    <div className="h-screen flex flex-col gradient-bg">
      {/* Add debug component for testing - can be toggled by adding ?debug=true to URL */}
      {new URLSearchParams(window.location.search).get('debug') === 'true' && (
        <div className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-80 p-4">
          <SupabaseTestComponent />
        </div>
      )}
      {renderCurrentView()}
    </div>
  );
};

export default App;