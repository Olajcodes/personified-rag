import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, User, Bot, FileText, Briefcase, ChevronRight, Loader2, X, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';

const API_BASE_URL = "https://olajcodes-backend.onrender.com"; 

const ChatInterface = ({ onBack, isDarkMode, toggleTheme }) => {
  const [messages, setMessages] = useState([
    { 
        role: 'ai', 
        content: "Hi there! I'm an AI agent trained on Olajide's professional background.\n\nI can answer questions about his skills in AI Engineering, walk you through his projects, or help you draft a cover letter.\n\nWhat would you like to know?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  // Tools & UI State
  const [showSidebar, setShowSidebar] = useState(true); 
  const [activeTab, setActiveTab] = useState('tools'); // 'tools' or 'history'
  const [jobDescription, setJobDescription] = useState('');
  const [generatingType, setGeneratingType] = useState(null); 
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLERS ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const newHistory = [...messages, { role: "user", content: input }];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, history: newHistory }),
      });

      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI Agent. Is the backend running?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDoc = async (type) => {
    setErrorMsg('');
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a Job Description first.");
      return;
    }
    setGeneratingType(type);
    
    const endpoint = type === 'cv' ? `${API_BASE_URL}/generate-cv` : `${API_BASE_URL}/generate-cover-letter`;
    const filename = type === 'cv' ? 'Olajide_CV.docx' : 'Olajide_Cover_Letter.docx';

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, model: "gpt-4o-mini" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove(); 
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.message.includes("not relevant") || error.message.includes("refused")) {
        setErrorMsg("⚠️ Skillset Mismatch: This role doesn't align with Olajide's core AI/Engineering expertise.");
      } else {
        setErrorMsg(`Error: ${error.message}`);
      }
    } finally {
      setGeneratingType(null);
    }
  };

const renderMessage = (text) => {
    const parts = text.split(/(\[Source: [^\]]+\])/g);
    return parts.map((part, index) => {
      //  Handle Citations
      if (part.startsWith('[Source:')) {
        const sourceName = part.replace('[Source: ', '').replace(']', '');
        return (
          <span key={index} className="inline-flex items-center gap-1 bg-green-600/10 text-green-600 text-xs px-2 py-0.5 rounded mx-1 border border-green-200 font-medium">
            <FileText size={10} />
            {sourceName}
          </span>
        );
      }
      
      //  Handle Bold Formatting (**text**) inside regular text
      const boldParts = part.split(/(\*\*[^\*]+\*\*)/g);
      return (
        <span key={index}>
          {boldParts.map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              // Strip asterisks and render bold
              return (
                <strong key={subIndex} className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {subPart.slice(2, -2)}
                </strong>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex h-screen overflow-hidden relative selection:bg-green-200 selection:text-green-900 transition-colors duration-300
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* === LEFT SIDE: CHAT AREA === */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Header */}
        <header className={`h-16 border-b flex items-center justify-between px-6 backdrop-blur z-10 transition-colors
          ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
          
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ArrowLeft size={20} />
            </button>
            
            <div className={`font-bold text-lg hidden md:block ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>OlajCodes AI</div>
            
            <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 px-3 py-1 rounded-full border border-green-200 font-medium">
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Privacy Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Theme Toggle */}
             <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-green-600 hover:bg-green-50'}`}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

            {!showSidebar && (
              <button 
                onClick={() => setShowSidebar(true)}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors
                  ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
              >
                <Briefcase size={16} />
                Menu
              </button>
            )}
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {(msg.role === 'ai' || msg.role === 'assistant') && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
                  ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <Bot size={16} className="text-green-600" />
                </div>
              )}
              <div className={`whitespace-pre-wrap max-w-[85%] p-4 rounded-2xl leading-relaxed text-sm md:text-base shadow-sm ${msg.role === 'user'
                ? 'bg-green-600 text-white rounded-br-none shadow-green-900/20' 
                : isDarkMode 
                    ? 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700' 
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                {renderMessage(msg.content)}
              </div>
              {msg.role === 'user' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                  ${isDarkMode ? 'bg-gray-700' : 'bg-green-100 text-green-700'}`}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="ml-12 text-gray-400 text-sm animate-pulse">Consulting knowledge base...</div>}
          <div ref={bottomRef} />
        </div>

        {/* Chat Input */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about skills, projects..."
              className={`flex-1 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all shadow-sm
                ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'}`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-lg shadow-green-600/20"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-gray-600 text-xs mt-3">
            AI answers grounded in GitHub & LinkedIn. Personal data is protected.
          </p>
        </div>
      </div>

      {/* === RIGHT SIDEBAR === */}
      {showSidebar && (
        <>
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
        <div className={`
          fixed inset-y-0 right-0 z-40 w-80 md:w-96 border-l shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
          ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
          md:relative md:translate-x-0 
          ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        `}>
          
          {/* Sidebar Header & Tabs */}
          <div className={`flex flex-col border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
            <div className="h-16 flex items-center justify-between px-6">
              <div className="font-bold flex items-center gap-2">
                <Briefcase size={18} className="text-green-600" />
                <span className={isDarkMode ? 'text-gray-100' : 'text-gray-800'}>Sidebar</span>
              </div>
              <button onClick={() => setShowSidebar(false)} className={`hover:bg-gray-200/20 p-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <X size={20} />
              </button>
            </div>
            
            {/* TABS */}
            <div className="flex px-6 pb-4 gap-4">
              <button 
                onClick={() => setActiveTab('tools')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'tools' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-400'}`}
              >
                Career Tools
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-400'}`}
              >
                Chat History
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className={`p-6 flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            
            {/* --- TAB 1: TOOLS --- */}
            {activeTab === 'tools' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the Job Description (JD) here..."
                    className={`w-full h-40 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all
                      ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>

                <div className="space-y-3 pt-4">
                  {/* GENERATE CV */}
                  <button onClick={() => handleGenerateDoc('cv')} disabled={!!generatingType || !jobDescription.trim()} 
                    className={`w-full flex items-center justify-between disabled:opacity-50 border p-4 rounded-xl transition-all group
                      ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600"><FileText size={20} /></div>
                      <div className="text-left">
                        <div className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Generate CV</div>
                        <div className="text-xs text-gray-500"> tailored .docx</div>
                      </div>
                    </div>
                    {generatingType === 'cv' ? <Loader2 className="animate-spin text-green-600" /> : <ChevronRight size={16} className="text-gray-400 group-hover:text-green-600" />}
                  </button>

                  {/* GENERATE COVER LETTER */}
                  <button onClick={() => handleGenerateDoc('cover-letter')} disabled={!!generatingType || !jobDescription.trim()} 
                    className={`w-full flex items-center justify-between disabled:opacity-50 border p-4 rounded-xl transition-all group
                      ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><FileText size={20} /></div>
                      <div className="text-left">
                        <div className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Cover Letter</div>
                        <div className="text-xs text-gray-500">persuasive .docx</div>
                      </div>
                    </div>
                    {generatingType === 'cover-letter' ? <Loader2 className="animate-spin text-emerald-600" /> : <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-600" />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                    <div className="text-red-500 mt-0.5 shrink-0"><AlertCircle size={16} /></div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{errorMsg}</p>
                    <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
                  </div>
                )}
                
                {generatingType && <div className="text-center text-xs text-green-600 animate-pulse mt-4">Analyzing profile & generating document...</div>}
              </div>
            )}

            {/* --- TAB 2: HISTORY --- */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-xs text-gray-500 mb-4">Current Session History</p>
                {messages.slice(1).map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border text-sm transition-colors cursor-default
                    ${isDarkMode ? 'bg-gray-800/50 border-gray-800 hover:bg-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-sm text-gray-700'}`}>
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase text-gray-400">
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="line-clamp-3">
                      {msg.content.replace(/\[Source:.*?\]/g, '')}
                    </div>
                  </div>
                ))}
                {messages.length <= 1 && (
                  <div className="text-center text-gray-500 text-sm py-10">No messages yet. Start chatting!</div>
                )}
              </div>
            )}

          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;