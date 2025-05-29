import React from 'react';

const TestComponent = () => {
  console.log('🧪 TestComponent: Rendering!');
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      fontSize: '20px',
      zIndex: 10000
    }}>
      TEST COMPONENT IS WORKING!
      <br />
      If you see this, React is working.
    </div>
  );
};

export default TestComponent;
