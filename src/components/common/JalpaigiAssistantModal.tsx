import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Mic,
  ArrowRight,
  ShieldCheck,
  Heart,
  Wrench,
  AlertTriangle,
  Briefcase,
  Car,
  MapPin,
  ExternalLink,
  Navigation,
  RotateCcw,
  Maximize2,
  ChevronDown,
  Building,
  HeartPulse,
  Compass
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { apiClient } from '../../services/apiClient';

interface GroundingPlace {
  title: string;
  uri: string;
  address?: string;
  snippets?: string[];
  category?: string;
}

interface AssistantMsg {
  role: 'user' | 'model';
  text: string;
  action?: { label: string; view: any; params?: any };
  groundingPlaces?: GroundingPlace[];
  modelUsed?: string;
}

export const JalpaigiAssistantModal: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, navigate } = useNav();
  const { location } = useLocation();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'general' | 'emergency' | 'civic' | 'services' | 'tourism'>('general');
  const [selectedTier, setSelectedTier] = useState<'complex' | 'general' | 'fast'>('general');
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const [chatHistory, setChatHistory] = useState<AssistantMsg[]>([
    {
      role: 'model',
      text: 'Nomoshkar! I am your **Jalpaigi AI Assistant** powered by **Gemini & Google Maps Grounding**.\n\nTell me what you need in Jalpaiguri—such as finding a verified electrician, Sadar Hospital emergency help, blood donors, or exploring heritage places.',
      groundingPlaces: [
        {
          title: 'Jalpaiguri District Sadar Hospital',
          uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
          address: 'Hospital Road, Kadamtala, Jalpaiguri',
          snippets: ['24x7 Emergency Trauma Unit & Blood Bank']
        }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  if (!isAssistantOpen) return null;

  const quickChips = [
    { label: 'Need Electrician', query: 'I need a verified electrician urgently near Kadamtala', role: 'services' as const },
    { label: 'Find O+ Blood', query: 'Need O+ blood donor near Sadar hospital', role: 'emergency' as const },
    { label: 'Report Pothole', query: 'I want to report broken road waterlogging near Adarpara', role: 'civic' as const },
    { label: 'Hospital Emergency', query: 'What is Jalpaiguri Sadar Hospital emergency phone & address?', role: 'emergency' as const },
    { label: 'Visit Rajbari Dighi', query: 'Tell me about Rajbari Dighi & Baikunthapur Palace timings', role: 'tourism' as const },
    { label: 'Vehicle Breakdown', query: 'My bike broke down near Teesta bridge, need mechanic', role: 'services' as const }
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || prompt).trim();
    if (!query || loading) return;

    const lower = query.toLowerCase();
    const userMsg: AssistantMsg = { role: 'user', text: query };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
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
      const historyPayload = updatedHistory.slice(-8).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await apiClient.geminiChat({
        message: query,
        history: historyPayload,
        role: selectedRole,
        modelType: selectedTier,
        useMaps: true,
        userLocation: {
          latitude: location.lat || 26.5414,
          longitude: location.lng || 88.7196
        }
      });

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'model',
          text: res?.reply || 'Nomoshkar! I am here to help you connect with Jalpaiguri civic services and emergency contacts.',
          action: detectedAction,
          groundingPlaces: res?.groundingPlaces,
          modelUsed: res?.modelUsed
        }
      ]);
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Nomoshkar! For immediate emergency healthcare, contact District Sadar Hospital at `03561-230006` or visit Hospital Road.',
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
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[88vh] max-h-[680px] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#063B2C] text-white p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#A7D7B9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base tracking-tight">Jalpaigi AI Assistant</h3>
                <span className="text-[9px] bg-emerald-700 text-emerald-100 font-bold px-1.5 py-0.2 rounded">
                  Gemini + Maps
                </span>
              </div>
              <p className="text-xs text-[#D2EBE0]">Civic Intelligence • বাংলা & English</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsAssistantOpen(false);
                navigate('ai-chat');
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Open Full Screen AI Chat"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAssistantOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role Bar */}
        <div className="bg-[#FAF8F5] px-3 py-2 border-b border-[#E8E4DA] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#55685F]">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-white border border-[#D2CEBE] rounded-lg px-2 py-1 text-xs font-bold text-[#063B2C] focus:outline-none"
            >
              <option value="general">City Guide</option>
              <option value="emergency">Emergency & Healthcare</option>
              <option value="civic">Municipal Grievances</option>
              <option value="services">Verified Services</option>
              <option value="tourism">Tourism & Heritage</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#55685F]">Model:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="bg-white border border-[#D2CEBE] rounded-lg px-2 py-1 text-xs font-bold text-[#063B2C] focus:outline-none"
            >
              <option value="general">Flash (Default)</option>
              <option value="complex">Pro (Complex)</option>
              <option value="fast">Lite (Fast)</option>
            </select>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F5]">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#063B2C] text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-white text-[#11241C] border border-[#E8E4DA] rounded-bl-none shadow-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p>{msg.text}</p>
                ) : (
                  <div className="prose prose-xs max-w-none text-[#11241C] space-y-1">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1.5 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 my-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 my-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-extrabold text-[#063B2C]">{children}</strong>
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {msg.action && (
                <button
                  onClick={() => {
                    setIsAssistantOpen(false);
                    navigate(msg.action!.view, msg.action!.params);
                  }}
                  className="inline-flex items-center gap-2 bg-[#E6F4EA] border border-[#A7D7B9] text-[#063B2C] px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs hover:bg-[#C8E6C9] active:scale-95 transition-all cursor-pointer"
                >
                  <span>{msg.action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Grounding Places Card */}
              {msg.groundingPlaces && msg.groundingPlaces.length > 0 && (
                <div className="w-full max-w-[90%] space-y-2 mt-1">
                  <div className="text-[11px] font-extrabold text-[#063B2C] flex items-center gap-1 px-1">
                    <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                    <span>Google Maps Grounded Locations:</span>
                  </div>
                  {msg.groundingPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#A7D7B9] rounded-2xl p-2.5 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-[#11241C]">{place.title}</h4>
                        {place.category && (
                          <span className="text-[9px] font-bold bg-[#E6F4EA] text-[#063B2C] px-1.5 py-0.2 rounded-full">
                            {place.category}
                          </span>
                        )}
                      </div>
                      {place.address && (
                        <p className="text-[10px] text-[#55685F]">{place.address}</p>
                      )}
                      {place.snippets && place.snippets[0] && (
                        <p className="text-[10px] italic text-[#55685F] bg-[#FAF8F5] p-1.5 rounded-lg border border-[#E8E4DA]">
                          "{place.snippets[0]}"
                        </p>
                      )}
                      <a
                        href={place.uri || `https://maps.google.com/?q=${encodeURIComponent(place.title + ' Jalpaiguri')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 w-full bg-[#063B2C] text-white py-1 rounded-xl text-xs font-bold hover:bg-[#084D3A] transition-all cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3 opacity-80 ml-auto mr-1" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#063B2C] bg-white border border-[#A7D7B9] p-3 rounded-2xl max-w-[220px] shadow-xs">
              <div className="w-2 h-2 rounded-full bg-[#063B2C] animate-ping"></div>
              <span>Jalpaigi AI is reasoning…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="p-2.5 bg-white border-t border-[#F0ECE1] overflow-x-auto no-scrollbar flex gap-2">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedRole(chip.role);
                handleSend(chip.query);
              }}
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
              disabled={loading}
            />
            <button
              onClick={() => handleSend('Tell me 24x7 emergency contacts and hospitals in Jalpaiguri')}
              className="absolute right-2.5 text-[#55685F] hover:text-[#063B2C]"
              title="Quick query"
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

