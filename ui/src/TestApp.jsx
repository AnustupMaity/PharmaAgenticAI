import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>PharmaAI Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ margin: '20px 0' }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
      <p>Navigation test:</p>
      <ul>
        <li><a href="/" style={{ color: '#2563eb' }}>Home</a></li>
        <li><a href="/dashboard" style={{ color: '#2563eb' }}>Dashboard</a></li>
        <li><a href="/reports" style={{ color: '#2563eb' }}>Reports</a></li>
      </ul>
    </div>
  );
};

export default TestApp;