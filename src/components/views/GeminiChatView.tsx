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
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../services/apiClient';

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
  const { isDarkMode } = useTheme();

  const [selectedRole, setSelectedRole] = useState<RoleType>('general');
  const [selectedModelTier, setSelectedModelTier] = useState<ModelTier>('general');
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(true);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn' | null>(() => {
    const saved = localStorage.getItem('jpg_ai_language');
    return (saved as 'en' | 'bn') || null;
  });

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
    return [];
  });

  // Initial Greeting Effect
  useEffect(() => {
    if (messages.length === 0 && selectedLanguage) {
      const greeting = selectedLanguage === 'bn' 
        ? "নমস্কার! MYJPG AI Assistant-এ স্বাগতম। আমি কীভাবে আপনাকে সাহায্য করতে পারি?"
        : "Nomoskar! Welcome to MYJPG AI Assistant. How can I help you today?";
      
      setMessages([{
        id: 'msg-init-1',
        role: 'model',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleUsed: 'general',
        modelUsed: 'gemini-3.5-flash',
        groundingPlaces: []
      }]);
    }
  }, [selectedLanguage, messages.length]);

  // Save conversation history & language to local storage
  useEffect(() => {
    try {
      localStorage.setItem('jpg_gemini_chat_history', JSON.stringify(messages));
      if (selectedLanguage) {
        localStorage.setItem('jpg_ai_language', selectedLanguage);
      }
    } catch (e) {
      // ignore
    }
  }, [messages, selectedLanguage]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const rolesConfig: Record<RoleType, { label: string; icon: React.ReactNode; desc: string; badge: string }> = {
    general: {
      label: 'City Guide & Community',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
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
      icon: <Sparkles className="w-3.5 h-3.5 text-blue-600" />,
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

      const res = await apiClient.geminiChat({
        message: textToSend,
        history: historyPayload,
        role: selectedRole,
        modelType: selectedModelTier,
        useMaps: useMapsGrounding,
        userLocation: {
          latitude: location.lat || 26.5414,
          longitude: location.lng || 88.7196
        }
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
        text: `Nomoshkar! I am having trouble connecting right now. Please try again in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingPlaces: []
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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#020617] flex flex-col justify-between max-w-md mx-auto select-none transition-colors">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B1224]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA] dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-[#EFECE6] dark:hover:bg-[#334155] active:scale-95 transition-all cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#11241C] dark:text-white">Jalpaigi AI</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#007AFF] text-[10px] font-bold text-white tracking-wide uppercase">
                  Gemini
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#55685F] dark:text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-semibold">{rolesConfig[selectedRole].badge}</span>
                <span>•</span>
                <span className="truncate max-w-[120px]">📍 {location.locality || 'Jalpaiguri'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#94A3B8] hover:text-[#D9383A] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-all cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('maps-explorer')}
              className="px-2.5 py-1 rounded-full bg-[#E6F4EA] dark:bg-blue-900/30 border border-[#A7D7B9] dark:border-blue-800/50 text-[#007AFF] dark:text-blue-400 text-[11px] font-bold flex items-center gap-1 hover:bg-[#C8E6C9] dark:hover:bg-blue-800/50 transition-all cursor-pointer"
              title="Explore Google Maps Grounded Places"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Maps</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls Bar: Role Selector & Model Tier Pill */}
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#F0ECE1] dark:border-white/10 overflow-x-auto no-scrollbar">
          {/* Role selector dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowModelMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#1E293B] border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white hover:bg-[#E6F4EA] dark:hover:bg-blue-900/30 hover:border-[#007AFF] transition-all cursor-pointer shrink-0"
            >
              {rolesConfig[selectedRole].icon}
              <span>{rolesConfig[selectedRole].badge}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#55685F] dark:text-[#94A3B8]" />
            </button>

            {/* Role dropdown */}
            {showRoleMenu && (
              <div className="absolute left-0 top-9 w-64 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-[#E8E4DA] dark:border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-extrabold text-[#73827B] dark:text-[#94A3B8] uppercase tracking-wider">
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
                      selectedRole === r ? 'bg-[#E6F4EA] dark:bg-blue-900/40 text-[#007AFF] dark:text-blue-400' : 'hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-[#11241C] dark:text-white'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 shrink-0 mt-0.5">
                      {rolesConfig[r].icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{rolesConfig[r].label}</div>
                      <div className="text-[10px] text-[#55685F] dark:text-[#94A3B8] leading-tight">{rolesConfig[r].desc}</div>
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#1E293B] border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white hover:bg-[#E6F4EA] dark:hover:bg-blue-900/30 transition-all cursor-pointer shrink-0"
            >
              {modelTierConfig[selectedModelTier].icon}
              <span>{modelTierConfig[selectedModelTier].tag}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#55685F] dark:text-[#94A3B8]" />
            </button>

            {/* Model Tier Dropdown */}
            {showModelMenu && (
              <div className="absolute left-0 top-9 w-60 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-[#E8E4DA] dark:border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-extrabold text-[#73827B] dark:text-[#94A3B8] uppercase tracking-wider">
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
                      selectedModelTier === m ? 'bg-[#E6F4EA] dark:bg-blue-900/40 text-[#007AFF] dark:text-blue-400' : 'hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-[#11241C] dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {modelTierConfig[m].icon}
                      <div>
                        <div className="text-xs font-bold">{modelTierConfig[m].label}</div>
                        <div className="text-[10px] text-[#55685F] dark:text-[#94A3B8]">{modelTierConfig[m].modelName}</div>
                      </div>
                    </div>
                    {selectedModelTier === m && <CheckCircle2 className="w-4 h-4 text-[#007AFF] dark:text-blue-400" />}
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
                ? 'bg-[#E6F4EA] dark:bg-blue-900/40 border border-[#007AFF] text-[#007AFF] dark:text-blue-400'
                : 'bg-white dark:bg-[#1E293B] border border-[#D2CEBE] dark:border-white/10 text-[#73827B] dark:text-[#94A3B8]'
            }`}
            title="Toggle Google Maps Grounding"
          >
            <MapPin className={`w-3.5 h-3.5 ${useMapsGrounding ? 'text-[#007AFF] dark:text-blue-400' : 'text-[#73827B] dark:text-[#94A3B8]'}`} />
            <span>Maps Grounding {useMapsGrounding ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Main Chat Thread Scroll Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {!selectedLanguage && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-[#007AFF] dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#11241C] dark:text-white">Choose your language</h2>
              <p className="text-xs text-[#55685F] dark:text-[#94A3B8] mt-1 font-semibold">আপনার ভাষা নির্বাচন করুন</p>
            </div>
            <div className="grid grid-cols-1 w-full gap-3 px-8">
              <button
                onClick={() => setSelectedLanguage('en')}
                className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 text-sm font-bold text-[#11241C] dark:text-white hover:border-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-xs"
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('bn')}
                className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 text-sm font-bold text-[#11241C] dark:text-white hover:border-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-xs"
              >
                বাংলা (Bengali)
              </button>
            </div>
          </div>
        )}

        {selectedLanguage && (
          <>
            {/* Intro banner */}
            <div className="bg-gradient-to-r from-[#007AFF] to-[#0056b3] dark:from-blue-700 dark:to-blue-900 text-white p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
              <span className="text-xs font-bold tracking-tight">Gemini Multi-Turn Civic AI</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Grounding Active
            </span>
          </div>
          <p className="text-[11px] text-blue-100 leading-snug">
            Maintaining conversation context across queries with local Jalpaiguri intelligence and live Google Maps citations.
          </p>
        </div>

        {selectedLanguage && messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            {/* Sender Badge */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#73827B] dark:text-[#94A3B8] px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You ({user?.name ? user.name.split(' ')[0] : 'Citizen'})</span>
                  <User className="w-3 h-3 text-[#55685F] dark:text-[#94A3B8]" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
                  <span className="text-[#007AFF] dark:text-blue-400 font-extrabold">Jalpaigi AI</span>
                  {msg.modelUsed && (
                    <span className="text-[9px] bg-[#E6F4EA] dark:bg-blue-900/40 text-[#007AFF] dark:text-blue-400 px-1.5 py-0.2 rounded font-mono">
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
                  ? 'bg-[#007AFF] dark:bg-blue-600 text-white rounded-br-none font-medium'
                  : 'bg-white dark:bg-[#1E293B] text-[#11241C] dark:text-slate-100 border border-[#E8E4DA] dark:border-white/10 rounded-bl-none font-normal'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="prose prose-xs max-w-none text-[#11241C] dark:text-slate-100 space-y-2">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 leading-relaxed text-xs">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1 text-xs">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1 text-xs">{children}</ol>,
                      li: ({ children }) => <li className="text-xs">{children}</li>,
                      strong: ({ children }) => <strong className="font-extrabold text-[#007AFF] dark:text-blue-400">{children}</strong>,
                      code: ({ children }) => (
                        <code className="bg-[#FAF8F5] dark:bg-[#020617] border border-[#E8E4DA] dark:border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-[#007AFF] dark:text-blue-400">
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
                  msg.role === 'user' ? 'text-blue-200 dark:text-blue-300' : 'text-[#8C9B93] dark:text-[#94A3B8]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {/* Render Google Maps Grounding Cards if returned */}
            {msg.groundingPlaces && msg.groundingPlaces.length > 0 && (
              <div className="w-full max-w-[92%] space-y-2 mt-1">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#007AFF] dark:text-blue-400 px-1">
                  <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
                  <span>Verified Google Maps Locations & Citations</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {msg.groundingPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#1E293B] border border-[#A7D7B9] dark:border-blue-800/50 rounded-2xl p-3 shadow-xs hover:border-[#007AFF] dark:hover:border-blue-400 transition-all flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-[#11241C] dark:text-white flex items-center gap-1">
                            <span>📍</span>
                            <span>{place.title}</span>
                          </h4>
                          {place.category && (
                            <span className="text-[9px] font-bold bg-[#E6F4EA] dark:bg-blue-900/40 text-[#007AFF] dark:text-blue-400 px-2 py-0.5 rounded-full">
                              {place.category}
                            </span>
                          )}
                        </div>

                        {place.address && (
                          <p className="text-[11px] font-medium text-[#55685F] dark:text-slate-300 leading-tight">
                            {place.address}
                          </p>
                        )}

                        {place.snippets && place.snippets.length > 0 && (
                          <div className="bg-[#FAF8F5] dark:bg-[#020617] p-2 rounded-xl border border-[#E8E4DA] dark:border-white/10 text-[10px] text-[#55685F] dark:text-slate-400 italic">
                            "{place.snippets[0]}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#F0ECE1] dark:border-white/10">
                        <a
                          href={place.uri || `https://maps.google.com/?q=${encodeURIComponent(place.title + ' Jalpaiguri')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#007AFF] dark:bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#007AFF] dark:text-blue-400 bg-white dark:bg-[#1E293B] border border-[#A7D7B9] dark:border-blue-800/50 p-3.5 rounded-2xl max-w-[240px] shadow-xs">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </div>
            <span>Jalpaigi AI is grounding & reasoning…</span>
          </div>
        )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-white dark:bg-[#0F172A] border-t border-[#F0ECE1] dark:border-white/10 overflow-x-auto no-scrollbar flex gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedRole(p.role);
              handleSend(p.text);
            }}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] dark:bg-[#1E293B] border border-[#E0DCD3] dark:border-white/10 text-[#11241C] dark:text-slate-300 hover:bg-[#E6F4EA] dark:hover:bg-blue-900/30 hover:border-[#007AFF] hover:text-[#007AFF] transition-all cursor-pointer"
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
        className="p-3 bg-white dark:bg-[#0B1224] border-t border-[#E8E4DA] dark:border-white/10 flex items-center gap-2 shadow-lg"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask Jalpaigi AI (${rolesConfig[selectedRole].badge})...`}
          className="flex-1 bg-[#FAF8F5] dark:bg-[#1E293B] border border-[#D2CEBE] dark:border-white/10 rounded-full px-4 py-2.5 text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#007AFF] dark:focus:border-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#007AFF] dark:bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </form>
    </div>
  );
};
