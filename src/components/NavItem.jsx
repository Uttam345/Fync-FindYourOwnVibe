import React from 'react';
import { Compass, Calendar, MessageSquare, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Navigation Item Component
const NavItem = ({ view, currentView, navigate, icon, label }) => {
  const isActive = currentView === view || 
                  (view === 'events' && currentView === 'event-details') || 
                  (view === 'events' && currentView === 'event-chat') ||
                  (view === 'chats' && currentView === 'chat') ||
                  (view === 'profile' && ['edit-profile', 'connections', 'memories', 'create-memory'].includes(currentView));
  
  const renderIcon = () => {
    switch(icon) {
      case 'Compass':
        return <Compass />;
      case 'Calendar':
        return <Calendar />;
      case 'MessageSquare':
        return <MessageSquare />;
      case 'UserCircle':
        return <UserCircle />;
      default:
        return null;
    }
  };
    return (
    <motion.button 
      onClick={() => navigate(view)}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'text-white bg-white/20 backdrop-blur-sm' 
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {renderIcon()}
      </motion.div>
      <span className="text-xs mt-1 font-medium">{label}</span>
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

export default NavItem;