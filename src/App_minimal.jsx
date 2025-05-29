import React from 'react';
import TestComponent from './components/TestComponent';
import SimpleDebug from './components/SimpleDebug';

const App = () => {
  console.log('🚀 MINIMAL APP: Starting');
  
  return (
    <div style={{ 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <TestComponent />
      <SimpleDebug />
    </div>
  );
};

export default App;
