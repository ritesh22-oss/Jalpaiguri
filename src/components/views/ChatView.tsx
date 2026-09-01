import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Send,
  CheckCheck,
  ShieldCheck
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const ChatView: React.FC = () => {
  const { goBack, activeParams } = useNav();
  const { chatMessages, sendChatMessage } = useApp();
  const { user } = useAuth();

  const recipientId = activeParams?.recipientId || 'provider-default';
  const recipientName = activeParams?.recipientName || 'Service Provider';
  const profession = activeParams?.profession || 'Specialist';
  const recipientPhone = activeParams?.phone || '03561-230006';

  const threadMessages = chatMessages[recipientId] || [
    {
      id: 'init-1',
      senderId: recipientId,
      senderName: recipientName,
      text: `Namaskar! How can I assist you in Jalpaiguri?`,
      timestamp: 'Just now',
      isMe: false
    }
  ];

  const [inputText, setInputText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendChatMessage(recipientId, textToSend, user?.name || 'Citizen');
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
          onClick={() => window.location.href = `tel:${recipientPhone}`}
          className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center shadow-xs cursor-pointer"
        >
          <Phone className="w-4 h-4" />
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="text-center my-2">
          <span className="text-[10px] font-bold bg-[#EFECE6] text-[#55685F] px-3 py-1 rounded-full">
            Realtime Direct Connection
          </span>
        </div>

        {threadMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs font-semibold space-y-1 shadow-xs ${
                m.isMe
                  ? 'bg-[#063B2C] text-white rounded-br-none'
                  : 'bg-white text-[#11241C] border border-[#E8E4DA] rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              <div
                className={`text-[9px] flex items-center justify-end gap-1 ${
                  m.isMe ? 'text-[#A7D7B9]' : 'text-[#8C9B93]'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.isMe && <CheckCheck className="w-3 h-3 text-[#A7D7B9]" />}
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
