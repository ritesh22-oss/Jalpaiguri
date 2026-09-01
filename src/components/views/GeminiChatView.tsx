import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  MapPin,
  ExternalLink,
  RotateCcw,
  Zap,
  Cpu,
  Flame,
  ShieldCheck,
  HeartPulse,
  Wrench,
  Compass,
  AlertTriangle,
  Building,
  Navigation,
  Bot,
  User,
  Info,
  CheckCircle2,
  ChevronDown,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/firebase';

export interface GroundingPlace {
  title: string;
  uri: string;
  address?: string;
  snippets?: string[];
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingPlaces?: GroundingPlace[];
  modelUsed?: string;
  roleUsed?: string;
}

type RoleType = 'general' | 'emergency' | 'civic' | 'services' | 'tourism';
type ModelTier = 'complex' | 'general' | 'fast';

export const GeminiChatView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { location } = useLocation();
  const { user } = useAuth();

  const [selectedRole, setSelectedRole] = useState<RoleType>('general');
  const [selectedModelTier, setSelectedModelTier] = useState<ModelTier>('general');
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(true);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Stored conversation history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('jpg_gemini_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'msg-init-1',
        role: 'model',
        text: `Nomoshkar! I am **Jalpaigi AI**, your smart civic assistant powered by **Gemini** with live **Google Maps Grounding** for Jalpaiguri.\n\nAsk me about local services, doctors at Sadar Hospital, emergency blood, tourist spots like Rajbari Dighi, or how to report civic complaints!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleUsed: 'general',
        modelUsed: 'gemini-2.5-flash',
        groundingPlaces: [
          {
            title: 'Jalpaiguri District Sadar Hospital',
            uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
            address: 'Hospital Road, Kadamtala, Jalpaiguri',
            snippets: ['24x7 Emergency Services & Blood Bank']
          },
          {
            title: 'Rajbari Dighi & Royal Palace',
            uri: 'https://maps.google.com/?q=Rajbari+Dighi+Jalpaiguri',
            address: 'Rajbari, Jalpaiguri, West Bengal',
            snippets: ['Historic tourist attraction & recreational lake']
          }
        ]
      }
    ];
  });

  // Save conversation history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('jpg_gemini_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const rolesConfig: Record<RoleType, { label: string; icon: React.ReactNode; desc: string; badge: string }> = {
    general: {
      label: 'City Guide & Community',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      desc: 'All-around assistant for Jalpaiguri life, local info & news',
      badge: 'City Guide'
    },
    emergency: {
      label: 'Emergency & Healthcare',
      icon: <HeartPulse className="w-4 h-4 text-rose-600" />,
      desc: 'Sadar Hospital, 24/7 blood banks, doctors & ambulances',
      badge: 'Emergency'
    },
    civic: {
      label: 'Municipal Grievances',
      icon: <Building className="w-4 h-4 text-amber-600" />,
      desc: 'Ward complaints, waterlogging, road repairs & WBSEDCL power',
      badge: 'Civic Specialist'
    },
    services: {
      label: 'Verified Trades & Workers',
      icon: <Wrench className="w-4 h-4 text-blue-600" />,
      desc: 'Electricians, plumbers, carpenters, drivers & price estimates',
      badge: 'Services'
    },
    tourism: {
      label: 'Heritage & Tourism',
      icon: <Compass className="w-4 h-4 text-purple-600" />,
      desc: 'Rajbari Dighi, Dooars tea gardens, Gorumara & local food',
      badge: 'Tourism'
    }
  };

  const modelTierConfig: Record<ModelTier, { label: string; modelName: string; icon: React.ReactNode; tag: string }> = {
    complex: {
      label: 'Deep Reasoning (Complex)',
      modelName: 'gemini-3.1-pro-preview',
      icon: <Cpu className="w-3.5 h-3.5 text-purple-600" />,
      tag: 'Pro Preview'
    },
    general: {
      label: 'General & Maps Grounding',
      modelName: 'gemini-3.5-flash',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
      tag: 'Flash'
    },
    fast: {
      label: 'Ultra Fast Tasks',
      modelName: 'gemini-3.1-flash-lite',
      icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
      tag: 'Flash-Lite'
    }
  };

  const samplePrompts = [
    { text: 'Where is the nearest 24/7 pharmacy in Jalpaiguri?', role: 'emergency' as RoleType },
    { text: 'Find verified electricians near Kadamtala', role: 'services' as RoleType },
    { text: 'How do I report waterlogging in my ward?', role: 'civic' as RoleType },
    { text: 'Top heritage spots to visit around Rajbari Dighi', role: 'tourism' as RoleType },
    { text: 'What is the emergency number for Sadar Hospital?', role: 'emergency' as RoleType }
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation payload for multi-turn history
      const historyPayload = newHistory.slice(-10).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await apiFetch<{
        reply: string;
        groundingPlaces?: GroundingPlace[];
        modelUsed?: string;
        role?: string;
      }>('/api/gemini/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          role: selectedRole,
          modelType: selectedModelTier,
          useMaps: useMapsGrounding,
          userLocation: {
            latitude: location.lat || 26.5414,
            longitude: location.lng || 88.7196
          }
        })
      });

      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: res?.reply || 'Nomoshkar! I am processing your request for Jalpaiguri.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingPlaces: res?.groundingPlaces || [],
        modelUsed: res?.modelUsed || modelTierConfig[selectedModelTier].modelName,
        roleUsed: selectedRole
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      const fallbackResponse: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: `Nomoshkar! For immediate assistance in Jalpaiguri, please visit District Sadar Hospital on Hospital Road or call emergency helpline \`03561-230006\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingPlaces: [
          {
            title: 'Jalpaiguri District Sadar Hospital',
            uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
            address: 'Hospital Road, Kadamtala, Jalpaiguri',
            snippets: ['24x7 Emergency Trauma Unit & Blood Bank']
          }
        ]
      };
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: `msg-reset-${Date.now()}`,
          role: 'model',
          text: `Conversation cleared. Nomoshkar! How can I assist you with Jalpaiguri civic matters, locations, or services today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleUsed: selectedRole,
          modelUsed: modelTierConfig[selectedModelTier].modelName
        }
      ];
      setMessages(resetMsg);
      localStorage.removeItem('jpg_gemini_chat_history');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between max-w-md mx-auto select-none">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-center text-[#11241C] hover:bg-[#EFECE6] active:scale-95 transition-all cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#11241C]">Jalpaigi AI</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#063B2C] text-[10px] font-bold text-white tracking-wide uppercase">
                  Gemini
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#55685F]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">{rolesConfig[selectedRole].badge}</span>
                <span>•</span>
                <span className="truncate max-w-[120px]">📍 {location.locality || 'Jalpaiguri'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E4DA] text-[#55685F] hover:text-[#D9383A] hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('maps-explorer')}
              className="px-2.5 py-1 rounded-full bg-[#E6F4EA] border border-[#A7D7B9] text-[#063B2C] text-[11px] font-bold flex items-center gap-1 hover:bg-[#C8E6C9] transition-all cursor-pointer"
              title="Explore Google Maps Grounded Places"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Maps</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls Bar: Role Selector & Model Tier Pill */}
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#F0ECE1] overflow-x-auto no-scrollbar">
          {/* Role selector dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowModelMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D2CEBE] text-xs font-bold text-[#11241C] hover:bg-[#E6F4EA] hover:border-[#063B2C] transition-all cursor-pointer shrink-0"
            >
              {rolesConfig[selectedRole].icon}
              <span>{rolesConfig[selectedRole].badge}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#55685F]" />
            </button>

            {/* Role dropdown */}
            {showRoleMenu && (
              <div className="absolute left-0 top-9 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-extrabold text-[#73827B] uppercase tracking-wider">
                  Select Assistant Role
                </div>
                {(Object.keys(rolesConfig) as RoleType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                      selectedRole === r ? 'bg-[#E6F4EA] text-[#063B2C]' : 'hover:bg-[#FAF8F5] text-[#11241C]'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-white border border-[#E8E4DA] shrink-0 mt-0.5">
                      {rolesConfig[r].icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{rolesConfig[r].label}</div>
                      <div className="text-[10px] text-[#55685F] leading-tight">{rolesConfig[r].desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model Tier Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowModelMenu(!showModelMenu);
                setShowRoleMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D2CEBE] text-xs font-bold text-[#11241C] hover:bg-[#E6F4EA] transition-all cursor-pointer shrink-0"
            >
              {modelTierConfig[selectedModelTier].icon}
              <span>{modelTierConfig[selectedModelTier].tag}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#55685F]" />
            </button>

            {/* Model Tier Dropdown */}
            {showModelMenu && (
              <div className="absolute left-0 top-9 w-60 bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-extrabold text-[#73827B] uppercase tracking-wider">
                  Gemini Model Tier
                </div>
                {(Object.keys(modelTierConfig) as ModelTier[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedModelTier(m);
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      selectedModelTier === m ? 'bg-[#E6F4EA] text-[#063B2C]' : 'hover:bg-[#FAF8F5] text-[#11241C]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {modelTierConfig[m].icon}
                      <div>
                        <div className="text-xs font-bold">{modelTierConfig[m].label}</div>
                        <div className="text-[10px] text-[#55685F]">{modelTierConfig[m].modelName}</div>
                      </div>
                    </div>
                    {selectedModelTier === m && <CheckCircle2 className="w-4 h-4 text-[#063B2C]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Maps Grounding Toggle Pill */}
          <button
            onClick={() => setUseMapsGrounding(!useMapsGrounding)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              useMapsGrounding
                ? 'bg-[#E6F4EA] border border-[#063B2C] text-[#063B2C]'
                : 'bg-white border border-[#D2CEBE] text-[#73827B]'
            }`}
            title="Toggle Google Maps Grounding"
          >
            <MapPin className={`w-3.5 h-3.5 ${useMapsGrounding ? 'text-[#063B2C]' : 'text-[#73827B]'}`} />
            <span>Google Maps Grounding {useMapsGrounding ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Main Chat Thread Scroll Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-[#063B2C] to-[#0A58CA] text-white p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span className="text-xs font-bold tracking-tight">Gemini Multi-Turn Civic AI</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Grounding Active
            </span>
          </div>
          <p className="text-[11px] text-emerald-100 leading-snug">
            Maintaining conversation context across queries with local Jalpaiguri intelligence and live Google Maps citations.
          </p>
        </div>

        {/* Message Items */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            {/* Sender Badge */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#73827B] px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You ({user?.name ? user.name.split(' ')[0] : 'Citizen'})</span>
                  <User className="w-3 h-3 text-[#55685F]" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-[#063B2C]" />
                  <span className="text-[#063B2C] font-extrabold">Jalpaigi AI</span>
                  {msg.modelUsed && (
                    <span className="text-[9px] bg-[#E6F4EA] text-[#063B2C] px-1.5 py-0.2 rounded font-mono">
                      {msg.modelUsed}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-[#063B2C] text-white rounded-br-none font-medium'
                  : 'bg-white text-[#11241C] border border-[#E8E4DA] rounded-bl-none font-normal'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="prose prose-xs max-w-none text-[#11241C] space-y-2">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 leading-relaxed text-xs">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1 text-xs">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1 text-xs">{children}</ol>,
                      li: ({ children }) => <li className="text-xs">{children}</li>,
                      strong: ({ children }) => <strong className="font-extrabold text-[#063B2C]">{children}</strong>,
                      code: ({ children }) => (
                        <code className="bg-[#FAF8F5] border border-[#E8E4DA] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#063B2C]">
                          {children}
                        </code>
                      )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-[9px] text-right mt-1.5 ${
                  msg.role === 'user' ? 'text-emerald-200' : 'text-[#8C9B93]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {/* Render Google Maps Grounding Cards if returned */}
            {msg.groundingPlaces && msg.groundingPlaces.length > 0 && (
              <div className="w-full max-w-[92%] space-y-2 mt-1">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#063B2C] px-1">
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                  <span>Verified Google Maps Locations & Citations</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {msg.groundingPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#A7D7B9] rounded-2xl p-3 shadow-xs hover:border-[#063B2C] transition-all flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-[#11241C] flex items-center gap-1">
                            <span>📍</span>
                            <span>{place.title}</span>
                          </h4>
                          {place.category && (
                            <span className="text-[9px] font-bold bg-[#E6F4EA] text-[#063B2C] px-2 py-0.5 rounded-full">
                              {place.category}
                            </span>
                          )}
                        </div>

                        {place.address && (
                          <p className="text-[11px] font-medium text-[#55685F] leading-tight">
                            {place.address}
                          </p>
                        )}

                        {place.snippets && place.snippets.length > 0 && (
                          <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E8E4DA] text-[10px] text-[#55685F] italic">
                            "{place.snippets[0]}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#F0ECE1]">
                        <a
                          href={place.uri || `https://maps.google.com/?q=${encodeURIComponent(place.title + ' Jalpaiguri')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#063B2C] text-white hover:bg-[#084D3A] px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#063B2C] bg-white border border-[#A7D7B9] p-3.5 rounded-2xl max-w-[240px] shadow-xs">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </div>
            <span>Jalpaigi AI is grounding & reasoning…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-[#F0ECE1] overflow-x-auto no-scrollbar flex gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedRole(p.role);
              handleSend(p.text);
            }}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] border border-[#E0DCD3] text-[#11241C] hover:bg-[#E6F4EA] hover:border-[#063B2C] hover:text-[#063B2C] transition-all cursor-pointer"
          >
            {p.text}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-[#E8E4DA] flex items-center gap-2 shadow-lg"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask Jalpaigi AI (${rolesConfig[selectedRole].badge})...`}
          className="flex-1 bg-[#FAF8F5] border border-[#D2CEBE] rounded-full px-4 py-2.5 text-xs font-semibold text-[#11241C] focus:outline-none focus:border-[#063B2C]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#063B2C] text-white flex items-center justify-center shadow-md hover:bg-[#084D3A] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </form>
    </div>
  );
};
