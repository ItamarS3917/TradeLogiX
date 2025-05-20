// Sample code showing how to use Firebase Analytics in your app

import React from 'react';
import { analytics } from '../../config/firebase';

// Modified version to avoid Firebase import issues
// Original import: import { logEvent } from 'firebase/analytics';

// Example component with Analytics tracking
function AnalyticsExample() {
  
  // Function to log a custom event
  const trackButtonClick = (buttonName) => {
    // Modified to use mock analytics
    // Original: logEvent(analytics, 'button_click', {...})
    analytics.logEvent('button_click', {
      button_name: buttonName,
      timestamp: new Date().toString()
    });
    console.log(`Tracked click on: ${buttonName}`);
  };

  // Function to log a page view
  const trackPageView = (pageName) => {
    // Modified to use mock analytics
    // Original: logEvent(analytics, 'page_view', {...})
    analytics.logEvent('page_view', {
      page_name: pageName,
      page_path: window.location.pathname
    });
    console.log(`Tracked page view: ${pageName}`);
  };

  // Track page view when component mounts
  React.useEffect(() => {
    trackPageView('AnalyticsExample');
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Firebase Analytics Example</h2>
      <p>This component demonstrates how to use Firebase Analytics to track events.</p>
      
      <button
        onClick={() => trackButtonClick('primary_button')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          margin: '10px',
          cursor: 'pointer'
        }}
      >
        Primary Button
      </button>
      
      <button
        onClick={() => trackButtonClick('secondary_button')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#34A853',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          margin: '10px',
          cursor: 'pointer'
        }}
      >
        Secondary Button
      </button>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p>Note: Events logged will appear in the Firebase Console after a short delay.</p>
        <p>Check the developer console to confirm events are being sent.</p>
      </div>
    </div>
  );
}

export default AnalyticsExample;
