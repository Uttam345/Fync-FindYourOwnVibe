import React, { useState, useEffect } from 'react';
import { UserCircle, Calendar, MessageSquare, Compass, Settings, Music, LogOut, Heart, X, MapPin, Bell, Users } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import OnboardingProcess from './components/OnboardingProcess';
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
import SimpleDebug from './components/SimpleDebug';


// Main App Component
const App = () => {
  console.log('🚀 App: Component mounting/rendering');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(2);
  const [currentView, setCurrentView] = useState('discover');
  const [currentParams, setCurrentParams] = useState({});
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    
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
      
      console.log('👤 Getting current user...');
      const { data } = await AuthService.getCurrentUser();
      
      if (data) {
        console.log('✅ User authenticated:', data.user?.email);
        setUser(data.user);
        setProfile(data.profile);
        setIsAuthenticated(true);
        setIsFirstTimeUser(false);
        setCurrentView('discover');
      } else {
        console.log('❌ No authenticated user, showing login');
        setCurrentView('login');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setCurrentView('login');
    } finally {
      setLoading(false);
      console.log('✅ Auth check completed');
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
      const { data, error } = await AuthService.signUp(
        userData.email, 
        userData.password, 
        userData
      );
      
      if (error) {
        throw error;
      }
      
      // Note: User will need to verify email before being fully authenticated
      // For demo purposes, we'll simulate login
      setUser(data.user);
      setProfile(userData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(false);
      setCurrentView('discover');
      return { success: true };
    } catch (error) {
      console.error('Onboarding failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
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
    console.log('🔍 App: renderCurrentView called', {
      loading,
      isAuthenticated,
      currentView,
      user: user?.email,
      profile: profile?.name
    });

    if (loading) {
      console.log('📊 App: Showing loading spinner');
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      console.log('🔒 App: User not authenticated, showing login/onboarding');
      if (isFirstTimeUser && currentView === 'onboarding') {
        return <OnboardingProcess onComplete={completeOnboarding} />;
      }
      return <LoginScreen onLogin={handleLogin} onNavigate={navigate} />;
    }

    console.log('✅ App: User authenticated, showing main app');
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
      {renderCurrentView()}
      <SimpleDebug />
    </div>
  );
};

export default App;