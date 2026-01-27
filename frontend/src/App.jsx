import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  
  // THEME STATE (Default to Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  return (

    <div className={isDarkMode ? 'dark' : ''}>
      
      {currentView === 'landing' && (
        <LandingPage 
          onStart={() => setCurrentView('chat')} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />
      )}
      
      {currentView === 'chat' && (
        <ChatInterface 
          onBack={() => setCurrentView('landing')} 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;