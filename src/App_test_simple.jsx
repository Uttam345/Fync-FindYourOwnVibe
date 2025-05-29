import React from 'react';

function App() {
  console.log('✅ App rendering successfully');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>      <div style={{
        textAlign: 'center',
        paddingTop: '50px'
      }}>
        <h1>🎵 FYNC</h1>
        <p>Find Your Own Vibe</p>
        <p>React App is Working!</p>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <p>✅ React: Working</p>
          <p>✅ Vite: Running on port 5174</p>
          <p>✅ Styles: Applied</p>
        </div>
      </div>
    </div>
  );
}

export default App;
