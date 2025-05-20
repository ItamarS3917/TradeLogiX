import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
export const KeyboardShortcutsContext = createContext(null);

// Custom hook for using keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === null) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState({
    'g d': { description: 'Go to Dashboard', action: () => window.navigate('/dashboard') },
    'g t': { description: 'Go to Trade Journal', action: () => window.navigate('/trades') },
    'g p': { description: 'Go to Daily Planning', action: () => window.navigate('/planning') },
    'g s': { description: 'Go to Statistics', action: () => window.navigate('/statistics') },
    'g a': { description: 'Go to TradeSage AI', action: () => window.navigate('/tradesage') },
    'g c': { description: 'Go to Cloud Sync', action: () => window.navigate('/cloud-sync') },
    'g v': { description: 'Go to TradingView', action: () => window.navigate('/tradingview') },
    'g x': { description: 'Go to Settings', action: () => window.navigate('/settings') },
    '?': { description: 'Show Keyboard Shortcuts', action: () => setShowShortcutsModal(true) },
    'n t': { description: 'New Trade', action: () => window.navigate('/trades/new') },
    'n p': { description: 'New Plan', action: () => window.navigate('/planning/new') },
  });

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [powerUserMode, setPowerUserMode] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState({});
  const [keysPressed, setKeysPressed] = useState([]);
  const [keySequenceTimeout, setKeySequenceTimeout] = useState(null);

  // Combine default and custom shortcuts
  const allShortcuts = { ...shortcuts, ...customShortcuts };

  // Handle keydown events
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if the event happened in an input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || 
          e.target.isContentEditable) {
        return;
      }

      // Clear previous timeout
      if (keySequenceTimeout) {
        clearTimeout(keySequenceTimeout);
      }

      // Add key to pressed keys array
      setKeysPressed(prev => [...prev, e.key.toLowerCase()]);
      
      // Set timeout to clear key sequence after 1s
      const timeout = setTimeout(() => {
        setKeysPressed([]);
      }, 1000);
      
      setKeySequenceTimeout(timeout);
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keySequenceTimeout) {
        clearTimeout(keySequenceTimeout);
      }
    };
  }, [keySequenceTimeout]);

  // Check if current key sequence matches any shortcuts
  useEffect(() => {
    if (keysPressed.length === 0) return;
    
    const keySequence = keysPressed.join(' ');
    
    // Look for command matches
    Object.entries(allShortcuts).forEach(([shortcut, config]) => {
      // Only execute if the full shortcut has been matched
      if (keySequence === shortcut) {
        config.action();
        setKeysPressed([]);
        if (keySequenceTimeout) {
          clearTimeout(keySequenceTimeout);
          setKeySequenceTimeout(null);
        }
      }
    });
  }, [keysPressed, allShortcuts, keySequenceTimeout]);

  // Add a custom shortcut
  const addCustomShortcut = (keys, description, action) => {
    setCustomShortcuts(prev => ({
      ...prev,
      [keys]: { description, action }
    }));
  };

  // Remove a custom shortcut
  const removeCustomShortcut = (keys) => {
    setCustomShortcuts(prev => {
      const newShortcuts = { ...prev };
      delete newShortcuts[keys];
      return newShortcuts;
    });
  };

  // Get all available shortcuts
  const getAvailableShortcuts = () => {
    return { ...shortcuts, ...customShortcuts };
  };

  // Toggle power user mode
  const togglePowerUserMode = () => {
    setPowerUserMode(!powerUserMode);
  };

  const value = {
    shortcuts: allShortcuts,
    showShortcutsModal,
    setShowShortcutsModal,
    powerUserMode,
    togglePowerUserMode,
    addCustomShortcut,
    removeCustomShortcut,
    getAvailableShortcuts,
    keysPressed
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export default KeyboardShortcutsProvider;
