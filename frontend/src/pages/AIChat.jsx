import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../utils/api';
import { MessageSquare, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const suggestedPrompts = [
    "What is a Zero FIR?",
    "How to handle street harassment?",
    "Basic self defense tips",
    "Helpline numbers in emergency"
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      setMessages(response.data);
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend) => {
    const msgText = textToSend || input;
    if (!msgText.trim()) return;

    // Clear text field
    if (!textToSend) setInput('');

    // Append user message locally first
    const userMsg = { id: Date.now(), message: msgText, response: null, isLocalUser: true };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(msgText);
      // Replace or update messages list
      loadChatHistory();
    } catch (e) {
      // Add error response locally
      setMessages(prev => [
        ...prev.filter(m => m.id !== userMsg.id),
        {
          id: Date.now() + 1,
          message: msgText,
          response: "Error connecting to AI safety assistant. Please check your network connection.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      
      {/* Chat header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="font-outfit text-xl font-bold text-white flex items-center space-x-2">
            <Bot className="h-5 w-5 text-safety-400" />
            <span>AI Safety Assistant</span>
          </h1>
          <p className="text-xs text-gray-400">Ask safety questions, legal rights, or self-defense methods.</p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-safety-500/10 border border-safety-500/20 text-safety-400 text-[10px] font-bold">
          <Sparkles className="h-3 w-3" />
          <span>Gemini Guard Link</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-safety-500/10 border border-safety-500/20 flex items-center justify-center text-safety-400">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">No safety logs active</h3>
              <p className="text-xs text-gray-400">Select one of the suggested safety questions below or write your own to get started.</p>
            </div>
            
            {/* Suggested Prompts */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 text-[11px] text-left font-semibold text-gray-300 bg-white/5 border border-white/5 hover:border-safety-500/30 hover:bg-white/10 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render chat message rows */}
        {messages.map((chat) => (
          <div key={chat.id} className="space-y-3">
            {/* User message bubble */}
            <div className="flex justify-end">
              <div className="flex items-end space-x-2 max-w-[80%]">
                <div className="rounded-2xl rounded-br-none bg-safety-500 px-4 py-2.5 text-xs text-white shadow-sm font-medium">
                  {chat.message}
                </div>
                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white flex-shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* AI Response bubble */}
            {chat.response && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <div className="h-6 w-6 rounded-full bg-safety-500/20 border border-safety-500/30 flex items-center justify-center text-safety-400 flex-shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-none bg-white/5 border border-white/5 px-4 py-2.5 text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                    {chat.response}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* AI Thinking loader */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 max-w-[85%]">
              <div className="h-6 w-6 rounded-full bg-safety-500/20 border border-safety-500/30 flex items-center justify-center text-safety-400 flex-shrink-0 animate-pulse">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-safety-400" />
                <span className="text-[11px] text-gray-400 font-medium">Assistant is drafting advice...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input prompt text bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 bg-[#161420] border border-white/10 rounded-2xl p-1.5 focus-within:border-safety-500/50 transition-colors"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about safety tools, legal Zero-FIR procedures..."
          className="flex-1 bg-transparent px-4 py-2 text-xs text-white outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-safety-500 hover:bg-safety-600 rounded-xl text-white disabled:opacity-50 disabled:hover:bg-safety-500 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
};

export default AIChat;
