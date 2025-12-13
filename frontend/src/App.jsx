import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="w-full h-screen">
      {showChat ? (
        // No props needed anymore. The ChatInterface calls the Backend, 
        // which already knows which repo to use.
        <ChatInterface /> 
      ) : (
        <LandingPage onStart={() => setShowChat(true)} />
      )}
    </div>
  );
}

export default App;