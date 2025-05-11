import React from 'react';
import '../test.css';

const TestPage = () => {
  return (
    <div className="test-container">
      <h1 className="test-title">Test Page</h1>
      <p className="test-content">If you can see this, React is rendering correctly!</p>
      <button onClick={() => alert('Button clicked!')}>Click me to test JavaScript</button>
    </div>
  );
};

export default TestPage;
