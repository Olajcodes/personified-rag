import React from 'react';
import { Github, ArrowRight, FileText, ShieldCheck, Database, Layers, Cpu, MousePointer, MessageSquare, Download, Sun, Moon, Terminal, Code2, Server } from 'lucide-react';

const LandingPage = ({ onStart, isDarkMode, toggleTheme }) => {
  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ease-in-out selection:bg-green-200 selection:text-green-900 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      
      {/* --- NAVBAR --- */}
      <nav className={`px-8 py-5 flex justify-between items-center max-w-7xl mx-auto sticky top-0 z-50 backdrop-blur-md transition-colors
        ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'}`}>
        
        <div className="flex items-center gap-2">
           <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
            OlajCodes<span className="text-green-600 text-2xl">AI</span> 
           </div>
        </div>

        {/* Desktop Links */}
        <div className={`hidden md:flex items-center gap-8 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <a href="#" className="hover:text-green-600 transition-colors">Home</a>
          <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
          <a href="#how-to-use" className="hover:text-green-600 transition-colors">How to Use</a>
          <a href="#architecture" className="hover:text-green-600 transition-colors">Architecture</a>
          <a href="https://github.com/Olajcodes" target="_blank" rel="noreferrer" className="hover:text-green-600 transition-colors">Github</a>
        </div>

        <div className="flex items-center gap-4">
           <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-green-600 hover:bg-green-50'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Button color changed to green */}
          <button 
            onClick={onStart}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Interview AI <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className={`max-w-7xl mx-auto px-6 mt-12 md:mt-24 mb-32 flex flex-col md:flex-row items-center gap-12`}>
        
        {/* Left: Text Content */}
        <div className="flex-1 text-left">
          <h1 className={`text-5xl md:text-6xl font-bold leading-[1.15] mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            I'm an AI Engineer <br />
            <span className="text-green-600">who builds Agents.</span>
          </h1>
          <p className={`text-lg mb-8 leading-relaxed max-w-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            I am an autonomous RAG Agent tailored to Olajide's codebase. I can explain architecture, critique code, and generate a tailored CV for your job opening.
          </p>
          
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-all shadow-lg hover:shadow-green-600/30 transform hover:-translate-y-1"
          >
            Start Interview
          </button>
        </div>

        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center relative">
          <div className={`relative w-full max-w-md aspect-square rounded-3xl p-8 flex flex-col justify-center items-center shadow-2xl animate-float
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
             
             <div className="absolute top-10 right-10 text-green-200 opacity-50"><Code2 size={120} /></div>
             
             <div className="absolute top-1/2 -left-8 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow border border-gray-100">
                <div className="bg-green-100 p-2 rounded-lg text-green-600"><ShieldCheck size={24} /></div>
                <div>
                   <div className="text-xs text-gray-500 font-bold">Guardrails</div>
                   <div className="text-sm font-bold text-gray-800">Active</div>
                </div>
             </div>

             <div className="absolute bottom-12 -right-4 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-pulse border border-gray-100">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Database size={24} /></div>
                <div>
                   <div className="text-xs text-gray-500 font-bold">RAG Sources</div>
                   <div className="text-sm font-bold text-gray-800">Connected</div>
                </div>
             </div>

             <Terminal size={140} className="text-green-600 relative z-10" />
             <div className={`mt-6 font-mono text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                &gt; olajcodes_ai initialized... <br/>
                &gt; reading_embeded docs... <br/>
                &gt; ready_to_interview.
             </div>
          </div>
        </div>
      </div>

      {/* --- TECH STACK STRIP --- */}
      <div className={`py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Core Technologies</p>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Built with a modern, robust tech stack</p>
            
            <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2 text-xl font-bold"><Code2 size={32} /> Python</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Terminal size={32} /> React</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Server size={32} /> FastAPI</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Database size={32} /> ChromaDB</div>
               <div className="flex items-center gap-2 text-xl font-bold"><Cpu size={32} /> OpenAI</div>
            </div>
         </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div id="features" className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
               An Autonomous RAG Agent <br/> for Recruitment
            </h2>
            <p className={`text-gray-500 mb-16 ${isDarkMode ? 'text-gray-400' : ''}`}>Key capabilities of the system</p>

            <div className="grid md:grid-cols-3 gap-8">
               <FeatureCard 
                  isDarkMode={isDarkMode}
                  icon={<FileText size={40} />}
                  title="Tailored Generation"
                  desc="Generates CVs and Cover Letters tailored to specific Job Descriptions instantly."
               />
               <FeatureCard 
                  isDarkMode={isDarkMode}
                  icon={<ShieldCheck size={40} />}
                  title="Context Guardrails"
                  desc="Strictly professional. Refuses to answer unrelated personal questions."
               />
               <FeatureCard 
                  isDarkMode={isDarkMode}
                  icon={<Database size={40} />}
                  title="Evidence-Based"
                  desc="No hallucinations. Every answer cites specific files from my GitHub."
               />
            </div>
         </div>
      </div>

      {/* --- 🌟 NEW: HOW TO USE SECTION 🌟 --- */}
      <div id="how-to-use" className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
         <div className="max-w-7xl mx-auto px-6 text-center">
             <h2 className={`text-3xl font-bold mb-16 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>How to Use This Portfolio</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <Step 
                  number={<MessageSquare size={24} />} 
                  title="Chat Contextually" 
                  desc="Ask questions like 'What is his experience with RAG?'" 
                  isDarkMode={isDarkMode} 
                />
                <Step 
                  number={<MousePointer size={24} />} 
                  title="Open Tools" 
                  desc="Click the 'Menu' button in the top right corner of the chat." 
                  isDarkMode={isDarkMode} 
                />
                <Step 
                  number={<Download size={24} />} 
                  title="Generate Docs" 
                  desc="Paste your Job Description to get a Tailored CV instantly." 
                  isDarkMode={isDarkMode} 
                />
             </div>
         </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-green-50'}`}>
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 relative">
               <div className={`aspect-[4/3] rounded-2xl flex items-center justify-center relative overflow-hidden
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <MessageSquare size={120} className="text-green-200" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent"></div>
               </div>
            </div>
            <div className="flex-1 text-left">
               <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Go beyond the static CV. <br/> Have a conversation.
               </h2>
               <p className={`mb-6 text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Actually, this is about how to use the portfolio. Simply start a chat to query my background. 
                  Unlike static sites, you can ask "Why did you use FastAPI?" and get a real answer citing line numbers.
               </p>
               <button onClick={onStart} className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors">
                  Start Interview Now
               </button>
            </div>
         </div>
      </div>

      {/* --- ARCHITECTURE SECTION --- */}
      <div id="architecture" className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
         <div className="max-w-7xl mx-auto px-6 text-center">
             <h2 className={`text-3xl font-bold mb-12 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>System Architecture</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Step number="1" title="Ingestion" desc="Scraping GitHub & PDFs" isDarkMode={isDarkMode} />
                <Step number="2" title="Embedding" desc="Vectorizing with OpenAI" isDarkMode={isDarkMode} />
                <Step number="3" title="Retrieval" desc="ChromaDB Context Search" isDarkMode={isDarkMode} />
                <Step number="4" title="Generation" desc="GPT-4o Response Crafting" isDarkMode={isDarkMode} />
             </div>
         </div>
      </div>
      
      {/* --- FOOTER --- */}
      <div className="border-t border-gray-800 py-8 text-sm text-gray-500 text-center">
         <p>© 2026 OlajCodes. All rights reserved.</p>
      </div>


    </div>
  );
};

// --- HELPER COMPONENTS ---

const FeatureCard = ({ isDarkMode, icon, title, desc }) => (
  <div className={`p-8 rounded-lg text-center transition-all duration-300 hover:-translate-y-2
    ${isDarkMode 
      ? 'bg-gray-800 shadow-lg' 
      : 'bg-white shadow-md hover:shadow-xl'}`}>
    <div className="inline-flex items-center justify-center p-4 rounded-tl-2xl rounded-br-2xl bg-green-100 text-green-600 mb-6">
      {icon}
    </div>
    <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
      {title}
    </h3>
    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      {desc}
    </p>
  </div>
);

const Step = ({ number, title, desc, isDarkMode }) => (
   <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg shadow-green-200">
         {number}
      </div>
      <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h4>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
   </div>
);

export default LandingPage;