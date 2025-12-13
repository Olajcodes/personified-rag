import React from 'react';
import { Github, ArrowRight, User, Code, FileText } from 'lucide-react';

const LandingPage = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-500 tracking-tighter">OlajcodesBot</div>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
          <Github size={24} />
        </a>
      </nav>

      {/* Main Hero Section */}
      <main className="max-w-4xl mx-auto mt-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          AI Assistant Online
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Interactive Portfolio
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Welcome. I am an AI assistant for <span className="text-white font-semibold">Olajcodes</span> trained on <span className="text-white font-semibold">his professional background</span> and <span className="text-white font-semibold">code repositories</span>. 
          Ask me anything about his skills, projects, or experience.
        </p>

        {/* Action Area - No Inputs, Just Action */}
        <div className="flex justify-center">
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70"
          >
            Start Conversation
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-6 text-left">
          {/* Card 1: Professional Profile */}
          <div className="p-6 bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700/50">
            <User className="text-blue-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2 text-white">Professional Profile</h3>
            <p className="text-gray-400 text-sm">
              Ingested from my LinkedIn to answer questions about my work history and skills.
            </p>
          </div>
          
          {/* Card 2: Code Analysis */}
          <div className="p-6 bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700/50">
            <Code className="text-purple-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2 text-white">Code Analysis</h3>
            <p className="text-gray-400 text-sm">
              Connected to my GitHub to explain my coding style and technical decisions.
            </p>
          </div>

          {/* Card 3: Privacy First */}
          <div className="p-6 bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700/50">
            <FileText className="text-green-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2 text-white">Privacy First</h3>
            <p className="text-gray-400 text-sm">
              Strict guardrails ensure no personal private data (address, phone, etc.) is shared.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;