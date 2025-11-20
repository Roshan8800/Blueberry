
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  time: string;
}

interface VipSupportProps {
  onBack: () => void;
}

const VipSupport: React.FC<VipSupportProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to the Blueberry VIP Concierge. My name is Sarah. How can I assist you with your premium experience today?", sender: 'agent', time: 'Now' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: 'Now'
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate agent response
    setTimeout(() => {
      const agentMsg: Message = {
        id: Date.now() + 1,
        text: "Thank you for your request. I am looking into that for you immediately. As a VIP member, your inquiry has top priority.",
        sender: 'agent',
        time: 'Now'
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto h-[calc(100vh-6rem)] animate-in fade-in zoom-in duration-300 flex flex-col">
        <div className="mb-6 flex items-center gap-4">
           <button 
             onClick={onBack}
             className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-800 transition-colors"
           >
              <i className="fa-solid fa-arrow-left text-white"></i>
           </button>
           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 p-0.5 shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                 <i className="fa-solid fa-headset text-2xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400"></i>
              </div>
           </div>
           <div>
              <h1 className="text-2xl font-bold text-white">VIP Concierge</h1>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <p className="text-gray-400 text-sm">Agents are online and ready to assist.</p>
              </div>
           </div>
        </div>

        <div className="flex-1 bg-[#0f172a]/80 border border-indigo-900/30 rounded-2xl backdrop-blur-sm flex flex-col overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[70%] rounded-2xl p-4 ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                          : 'bg-gray-800/80 text-gray-200 rounded-tl-none border border-gray-700'
                     }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                     </div>
                  </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-indigo-900/30">
               <form onSubmit={handleSend} className="flex gap-4">
                  <button type="button" className="text-gray-400 hover:text-cyan-400 transition-colors">
                     <i className="fa-solid fa-paperclip text-xl"></i>
                  </button>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your request here..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40 transition-all"
                  >
                     <i className="fa-solid fa-paper-plane"></i>
                  </button>
               </form>
            </div>
        </div>
    </div>
  );
};

export default VipSupport;
