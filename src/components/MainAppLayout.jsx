import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import NavItem from './NavItem';

// Main App Layout with Navigation
const MainAppLayout = ({ children, user, onLogout, notificationCount, currentView, navigate }) => {
  return (
    <div className="min-h-screen gradient-bg">
      <motion.header 
        className="glass border-b border-white/20 py-4 px-4 sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            FYNC
          </motion.h1>
          <div className="flex items-center space-x-3">
            <motion.button 
              className="relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} className="text-white" />
              {notificationCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {notificationCount}
                </motion.span>
              )}
            </motion.button>
            <motion.button 
              onClick={onLogout}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-red-500/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={20} className="text-white" />
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      <main className="flex-1 overflow-auto pb-20 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
      
      <motion.nav 
        className="fixed bottom-0 w-full max-w-[480px] left-1/2 transform -translate-x-1/2 glass border-t border-white/20 flex justify-around py-3 mx-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <NavItem view="discover" currentView={currentView} navigate={navigate} icon="Compass" label="Discover" />
        <NavItem view="events" currentView={currentView} navigate={navigate} icon="Calendar" label="Events" />
        <NavItem view="chats" currentView={currentView} navigate={navigate} icon="MessageSquare" label="Chats" />
        <NavItem view="profile" currentView={currentView} navigate={navigate} icon="UserCircle" label="Profile" />
      </motion.nav>
    </div>
  );
};

export default MainAppLayout;