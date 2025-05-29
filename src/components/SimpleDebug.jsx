import React, { useState, useEffect } from 'react';

const SimpleDebug = () => {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    console.log('🔍 SimpleDebug: Component mounted');
    setStatus('Debug panel loaded ✅');
    
    // Test if this component is rendering
    const timer = setInterval(() => {
      console.log('🔄 SimpleDebug: Still running at', new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔍 Simple Debug
      </h3>
      <div style={{ marginBottom: '8px' }}>
        Status: {status}
      </div>
      <div style={{ marginBottom: '8px' }}>
        URL: {window.location.href}
      </div>
      <div style={{ marginBottom: '8px' }}>
        Time: {new Date().toLocaleTimeString()}
      </div>
      <button 
        onClick={() => {
          console.log('🔄 Manual refresh clicked');
          setStatus('Refreshed at ' + new Date().toLocaleTimeString());
        }}
        style={{
          padding: '4px 8px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Refresh
      </button>
    </div>
  );
};

export default SimpleDebug;
