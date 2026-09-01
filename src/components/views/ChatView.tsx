import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Send,
  Image as ImageIcon,
  CheckCheck,
  ShieldCheck
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';

export const ChatView: React.FC = () => {
  const { goBack, activeParams } = useNav();

  const recipientName = activeParams?.recipientName || 'Ramesh Sarkar';
  const profession = activeParams?.profession || 'Electrician';

  const [messages, setMessages] = useState([
    { id: 1, text: `Hello! I see you need help with ${profession.toLowerCase()} work in Jalpaiguri.`, sender: 'other', time: '10:14 AM' },
    { id: 2, text: 'Hi! Yes, I wanted to check if you are available today.', sender: 'user', time: '10:15 AM' },
    { id: 3, text: 'Yes, I am available after 3:30 PM near Kadamtala. Please share your exact landmark.', sender: 'other', time: '10:16 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate quick auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `Got it! I will arrive on time. You can also call me directly if needed.`,
          sender: 'other',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between max-w-md mx-auto select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-extrabold text-[#11241C] leading-tight flex items-center gap-1">
              <span>{recipientName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#063B2C]" />
            </h2>
            <span className="text-[11px] font-semibold text-[#063B2C]">{profession} • Online</span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = 'tel:9832044102'}
          className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center shadow-xs cursor-pointer"
        >
          <Phone className="w-4 h-4" />
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="text-center my-2">
          <span className="text-[10px] font-bold bg-[#EFECE6] text-[#55685F] px-3 py-1 rounded-full">
            End-to-End Local Direct Connection
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs font-semibold space-y-1 shadow-xs ${
                m.sender === 'user'
                  ? 'bg-[#063B2C] text-white rounded-br-none'
                  : 'bg-white text-[#11241C] border border-[#E8E4DA] rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              <div
                className={`text-[9px] flex items-center justify-end gap-1 ${
                  m.sender === 'user' ? 'text-[#A7D7B9]' : 'text-[#8C9B93]'
                }`}
              >
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-[#A7D7B9]" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E8E4DA] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${recipientName.split(' ')[0]}...`}
          className="flex-1 bg-[#FAF8F5] border border-[#D2CEBE] rounded-full px-4 py-2.5 text-xs font-semibold text-[#11241C] focus:outline-none focus:border-[#063B2C]"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-full bg-[#063B2C] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </form>
    </div>
  );
};
