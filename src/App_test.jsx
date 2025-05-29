import React from 'react';

const App = () => {
  console.log('🚀 SUPER MINIMAL APP: Starting');
  
  // Test if this renders at all
  return React.createElement('div', {
    style: { 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'red',
      color: 'white',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }
  }, 'SUPER MINIMAL TEST - IF YOU SEE THIS, REACT IS WORKING!');
};

export default App;
