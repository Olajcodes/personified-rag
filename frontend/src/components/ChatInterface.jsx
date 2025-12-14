import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, User, Bot, FileText } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your Olajcodes Assistant. I can answer questions about his codebase and professional background." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. DEFINE newHistory FIRST
    // We create this variable here so we can use it in both setMessages AND fetch
    const newHistory = [...messages, { role: "user", content: input }];

    // 2. Update the UI
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // Connect to your real Backend API here
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          // 3. Now we can safely use newHistory here because it was defined above
          history: newHistory, 
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // 4. Add AI response
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "I am still being worked on. Coming Up Soon." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to highlight citations in the text
  const renderMessage = (text) => {
    // Regex to find [Source: ...] patterns
    const parts = text.split(/(\[Source: [^\]]+\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[Source:')) {
        // Render citation as a nice badge
        const sourceName = part.replace('[Source: ', '').replace(']', '');
        return (
          <span key={index} className="inline-flex items-center gap-1 bg-blue-900/50 text-blue-200 text-xs px-2 py-0.5 rounded mx-1 border border-blue-700/50">
            <FileText size={10} />
            {sourceName}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header with Privacy Badge */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/95 backdrop-blur">
        <div className="font-bold text-lg">Olajcodes Assistant</div>
        <div className="flex items-center gap-2 text-green-400 text-xs bg-green-900/20 px-3 py-1 rounded-full border border-green-900">
          <ShieldCheck size={14} />
          <span>Privacy Guardrails Active</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Check for both 'ai' (initial state) and 'assistant' (backend response) */}
            {(msg.role === 'ai' || msg.role === 'assistant') && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
            )}
            
            <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700'
            }`}>
              {renderMessage(msg.content)}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className="ml-12 text-gray-500 text-sm animate-pulse">Consulting Knowledge Base...</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me about his skills, projects, or experience..."
            className="flex-1 bg-gray-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-3">
          AI answers grounded in GitHub & LinkedIn. Personal data is protected.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;