import React, { useState } from 'react';
import { X, Sparkles, Send, Mic, ArrowRight, ShieldCheck, Heart, Wrench, AlertTriangle, Briefcase, Car } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { apiFetch } from '../../lib/supabase';

export const JalpaigiAssistantModal: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, navigate } = useNav();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'ai' | 'user'; text: string; action?: { label: string; view: any; params?: any } }>>([
    {
      role: 'ai',
      text: 'Namaskar! I am your Jalpaigi AI Civic Assistant. Tell me what you need in Jalpaiguri—such as finding an electrician, emergency blood, reporting waterlogging, or hospital help.'
    }
  ]);

  if (!isAssistantOpen) return null;

  const quickChips = [
    { label: 'Need Electrician', query: 'I need an electrician urgently in Kadamtala' },
    { label: 'Find O+ Blood', query: 'Need O+ blood donor near Sadar hospital' },
    { label: 'Report Pothole', query: 'I want to report broken road near Adarpara' },
    { label: 'Hospital Emergency', query: 'What is Jalpaiguri Sadar Hospital emergency phone?' },
    { label: 'Vehicle Breakdown', query: 'My bike broke down near Teesta bridge' },
    { label: 'Find a Job', query: 'Any delivery or store jobs available in Jalpaiguri?' }
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim()) return;

    const lower = query.toLowerCase();
    const userMsg = { role: 'user' as const, text: query };
    setChatHistory((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    let detectedAction: { label: string; view: any; params?: any } | undefined;

    if (lower.includes('electrician') || lower.includes('plumber') || lower.includes('carpenter') || lower.includes('worker') || lower.includes('repair') || lower.includes('ac')) {
      detectedAction = { label: 'View Verified Workers', view: 'workers' };
    } else if (lower.includes('blood') || lower.includes('donor')) {
      detectedAction = { label: 'Open Blood Help', view: 'blood' };
    } else if (lower.includes('road') || lower.includes('pothole') || lower.includes('garbage') || lower.includes('waterlogging') || lower.includes('light') || lower.includes('civic') || lower.includes('fix')) {
      detectedAction = { label: 'Report Civic Issue', view: 'report-problem' };
    } else if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('clinic') || lower.includes('cardiologist') || lower.includes('physician') || lower.includes('medicine')) {
      detectedAction = { label: 'Find Healthcare Near You', view: 'medical' };
    } else if (lower.includes('vehicle') || lower.includes('puncture') || lower.includes('towing') || lower.includes('bike') || lower.includes('car') || lower.includes('mechanic')) {
      detectedAction = { label: 'Request Vehicle Help', view: 'vehicle' };
    } else if (lower.includes('job') || lower.includes('hiring') || lower.includes('vacancy') || lower.includes('work')) {
      detectedAction = { label: 'Browse Local Jobs', view: 'jobs' };
    } else if (lower.includes('rental') || lower.includes('room') || lower.includes('flat') || lower.includes('pg') || lower.includes('house')) {
      detectedAction = { label: 'View Rentals', view: 'rentals' };
    } else if (lower.includes('lost') || lower.includes('found') || lower.includes('wallet') || lower.includes('keys')) {
      detectedAction = { label: 'Lost & Found Board', view: 'lost-found' };
    }

    try {
      const res = await apiFetch<{ reply: string }>('/api/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: query })
      });

      const replyText =
        res?.reply ||
        'I can help connect you with verified local trade workers, report civic issues directly to Jalpaiguri Municipality, or find emergency healthcare services.';

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: replyText,
          action: detectedAction
        }
      ]);
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'I can connect you directly with the right department or verified local specialists in Jalpaiguri.',
          action: detectedAction
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[640px] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#063B2C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#A7D7B9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Jalpaigi AI Assistant</h3>
              <p className="text-xs text-[#D2EBE0]">Local civic intelligence • বাংলা & English</p>
            </div>
          </div>
          <button
            onClick={() => setIsAssistantOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F5]">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#063B2C] text-white rounded-br-none shadow-sm'
                    : 'bg-white text-[#11241C] border border-[#E8E4DA] rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>

              {msg.action && (
                <button
                  onClick={() => {
                    setIsAssistantOpen(false);
                    navigate(msg.action!.view, msg.action!.params);
                  }}
                  className="mt-2 inline-flex items-center gap-2 bg-[#E6F4EA] border border-[#A7D7B9] text-[#063B2C] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#C8E6C9] active:scale-95 transition-all cursor-pointer"
                >
                  <span>{msg.action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#063B2C] bg-white border border-[#E8E4DA] p-3 rounded-2xl max-w-[200px]">
              <div className="w-2 h-2 rounded-full bg-[#063B2C] animate-ping"></div>
              <span>Jalpaigi is thinking…</span>
            </div>
          )}
        </div>

        {/* Quick Chips */}
        <div className="p-2.5 bg-white border-t border-[#F0ECE1] overflow-x-auto no-scrollbar flex gap-2">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF8F5] border border-[#E0DCD3] text-[#11241C] hover:bg-[#E6F4EA] hover:text-[#063B2C] transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E8E4DA] flex items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Ask anything about Jalpaiguri..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-full px-4 py-2.5 text-xs font-semibold text-[#11241C] focus:outline-none focus:border-[#063B2C] pr-10"
            />
            <button
              onClick={() => handleSend('Tell me emergency numbers in Jalpaiguri')}
              className="absolute right-2.5 text-[#55685F] hover:text-[#063B2C]"
              title="Voice query"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#063B2C] text-white flex items-center justify-center hover:bg-[#084D3A] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
