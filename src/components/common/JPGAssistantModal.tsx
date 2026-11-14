import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Mic,
  ArrowRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { apiClient } from '../../services/apiClient';
import { JPGLogo } from './JPGLogo';

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
  isError?: boolean;
  failedQuery?: string;
}

const CONTEXT_SUGGESTIONS = {
  en: {
    medical: ['Hospitals', 'Medical Services', 'Nearby Doctors'],
    education: ['Colleges', 'Schools', 'Admissions'],
    food: ['Cafes', 'Restaurants', 'Nearby Food'],
    jobs: ['Local Jobs', 'Workers', 'Job Opportunities'],
    blood: ['Blood Donors', 'Blood Banks', 'Blood Donation Info'],
    transport: ['Buses', 'Trains', 'Transport Info'],
    general: ['Doctors', 'Workers', 'Cafes', 'Blood Donors']
  },
  bn: {
    medical: ['হাসপাতাল', 'চিকিৎসা পরিষেবা', 'ডাক্তার'],
    education: ['কলেজ', 'স্কুল', 'ভর্তি সংক্রান্ত'],
    food: ['ক্যাফে', 'রেস্তোরাঁ', 'খাবার'],
    jobs: ['চাকরি', 'কাজের লোক', 'কাজের সুযোগ'],
    blood: ['রক্তদাতা', 'ব্লাড ব্যাংক', 'রক্তদানের তথ্য'],
    transport: ['বাস', 'ট্রেন', 'পরিবহন তথ্য'],
    general: ['ডাক্তার', 'কাজের লোক', 'ক্যাফে', 'রক্তদাতা']
  }
};

export const JPGAssistantModal: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, navigate } = useNav();
  const { location } = useLocation();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>(() => (localStorage.getItem('jpg_ai_language') as 'en' | 'bn') || 'en');

  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'bn' ? 'আপনার ব্রাউজার ভয়েস সমর্থন করে না।' : 'Your browser does not support voice input.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!streamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        setAudioLevel(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'bn' ? 'bn-IN' : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setPrompt(transcript);
      };
      
      recognition.onerror = () => {
        stopRecording();
      };
      
      recognition.onend = () => {
        stopRecording();
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert(lang === 'bn' ? 'মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে।' : 'Could not access the microphone.');
      stopRecording();
    }
  };

  useEffect(() => {
    localStorage.setItem('jpg_ai_language', lang);
  }, [lang]);

  const [chatHistory, setChatHistory] = useState<AssistantMsg[]>(() => {
    const lang = localStorage.getItem('jpg_ai_language') || 'en';
    const text = lang === 'bn' 
      ? 'নমস্কার! আমি আপনার **JPG AI Assistant**। আমি আপনাকে কীভাবে সাহায্য করতে পারি?'
      : 'Nomoshkar! I am your **JPG AI Assistant**. How can I help you today?';
    return [{ role: 'model', text, groundingPlaces: [] }];
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  if (!isAssistantOpen) return null;

  const quickChips = [
    { label: 'Verified Electrician', query: 'I need a verified electrician in Jalpaiguri', role: 'services' as const },
    { label: 'Find Blood', query: 'Help me find blood donors in Jalpaiguri', role: 'emergency' as const },
    { label: 'Civic Report', query: 'How to report a civic issue in Jalpaiguri?', role: 'civic' as const },
    { label: 'Explore Dooars', query: 'Tell me about tourism spots in Dooars', role: 'tourism' as const },
    { label: 'Vehicle Help', query: 'Need a mechanic for my vehicle in Jalpaiguri', role: 'services' as const }
  ];

  const getSuggestions = (text: string) => {
    const lower = text.toLowerCase();
    const suggestions = CONTEXT_SUGGESTIONS[lang];
    if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('medical') || lower.includes('ডাক্তার') || lower.includes('হাসপাতাল')) return suggestions.medical;
    if (lower.includes('college') || lower.includes('school') || lower.includes('education') || lower.includes('শিক্ষা')) return suggestions.education;
    if (lower.includes('cafe') || lower.includes('food') || lower.includes('restaurant') || lower.includes('খাবার')) return suggestions.food;
    if (lower.includes('job') || lower.includes('work') || lower.includes('worker') || lower.includes('চাকরি') || lower.includes('কাজের')) return suggestions.jobs;
    if (lower.includes('blood') || lower.includes('রক্ত')) return suggestions.blood;
    if (lower.includes('transport') || lower.includes('bus') || lower.includes('train') || lower.includes('বাস') || lower.includes('ট্রেন')) return suggestions.transport;
    return suggestions.general;
  };

  const handleSend = async (textToSend?: string, isRetry = false) => {
    if (isSubmittingRef.current) return;
    const query = (textToSend || prompt).trim();
    if (!query) return;

    isSubmittingRef.current = true;
    setLoading(true);

    let updatedHistory: AssistantMsg[];
    if (isRetry) {
      // Remove any trailing error message so we don't duplicate query or accumulate error boxes
      const cleanHistory = chatHistory.filter((m) => !m.isError);
      const lastMsg = cleanHistory[cleanHistory.length - 1];
      if (lastMsg && lastMsg.role === 'user' && lastMsg.text === query) {
        updatedHistory = cleanHistory;
      } else {
        updatedHistory = [...cleanHistory, { role: 'user', text: query }];
      }
    } else {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg && lastMsg.role === 'user' && lastMsg.text === query && loading) {
        // Prevent accidental double submit
        isSubmittingRef.current = false;
        return;
      }
      updatedHistory = [...chatHistory, { role: 'user', text: query }];
    }

    setChatHistory(updatedHistory);
    setPrompt('');

    try {
      const historyPayload = updatedHistory
        .filter((m) => !m.isError)
        .slice(-8)
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const res = await apiClient.geminiChat({
        message: query,
        history: historyPayload,
        role: 'general',
        modelType: 'general',
        useMaps: true,
        language: lang,
        userLocation: {
          latitude: location.lat || 26.5414,
          longitude: location.lng || 88.7196
        }
      });

      setChatHistory((prev) => [
        ...prev.filter((m) => !m.isError),
        {
          role: 'model',
          text: res?.reply || (lang === 'bn' ? 'নমস্কার! আমি আপনাকে কীভাবে সাহায্য করতে পারি?' : 'Nomoshkar! How can I help you?'),
          groundingPlaces: res?.groundingPlaces,
          modelUsed: res?.modelUsed
        }
      ]);
    } catch (e: any) {
      const statusCode = e?.status ?? 0;
      const rawMsg = e?.message || e?.error || '';
      const serverErr = typeof rawMsg === 'string' 
        ? rawMsg 
        : (typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : String(rawMsg));

      let displayMsg = '';
      if (statusCode === 0 || serverErr.toLowerCase().includes('failed to fetch') || serverErr.toLowerCase().includes('network')) {
        displayMsg = lang === 'bn'
          ? '⚠️ ব্যাকএন্ড সংযোগ ব্যর্থ: সার্ভারে পৌঁছানো যাচ্ছে না। আপনার ইন্টারনেট ও মোবাইল ডেটা যাচাই করে নিচে পুনরায় চেষ্টা বোতামে চাপ দিন।'
          : '⚠️ Backend Connection Error: Could not reach the MYJPG AI server (https://jalpaiguri-zxml.vercel.app). Please check your internet connectivity and tap Retry below.';
      } else if (statusCode === 429 || serverErr.includes('429') || serverErr.toLowerCase().includes('quota')) {
        displayMsg = lang === 'bn'
          ? '⚠️ এআই কোটা সাময়িকভাবে শেষ হয়েছে (429)। অনুগ্রহ করে এক মিনিট অপেক্ষা করে পুনরায় চেষ্টা করুন।'
          : '⚠️ AI Rate Limit / Quota Exceeded (429): Google AI Studio quota temporarily reached. Please wait a moment and tap Retry.';
      } else if (statusCode === 503 || serverErr.includes('503') || serverErr.toLowerCase().includes('high demand') || serverErr.toLowerCase().includes('unavailable')) {
        displayMsg = lang === 'bn'
          ? '⚠️ এআই মডেলটিতে অতিরিক্ত চাপের কারণে সাময়িক বিলম্ব হচ্ছে (503)। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।'
          : '⚠️ AI Service Busy (503): High demand spike on the AI model. Please tap Retry.';
      } else if (statusCode === 408 || serverErr.toLowerCase().includes('timed out')) {
        displayMsg = lang === 'bn'
          ? '⚠️ অনুরোধটির সময়সীমা শেষ হয়েছে (408)। পুনরায় চেষ্টা বোতামে চাপ দিন।'
          : '⚠️ Request Timed Out (408): The AI response took too long. Please tap Retry.';
      } else {
        displayMsg = lang === 'bn'
          ? `⚠️ এআই পরিষেবা ত্রুটি (${statusCode || 'Server'}): ${serverErr.slice(0, 150)}`
          : `⚠️ AI Service Error (${statusCode || 'Server'}): ${serverErr.slice(0, 150)}`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'model',
          text: displayMsg,
          isError: true,
          failedQuery: query
        }
      ]);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

// ... inside the component
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-[#020617] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[750px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* New Header Structure */}
        <div className="flex items-center p-4 border-b border-[#E8E4DA] dark:border-white/10">
          <JPGLogo size="xs" showText={false} className="mr-3" />
          <div className="flex-1">
            <h3 className="font-bold text-base text-[#11241C] dark:text-white">JPG AI Assistant</h3>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">Civic intelligence • বাংলা & English</p>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-blue-900/30 p-1 rounded-full text-[10px] font-bold">
            <button onClick={() => setLang('bn')} className={`px-2 py-1 rounded-full ${lang === 'bn' ? 'bg-white dark:bg-blue-900 shadow-sm text-blue-600' : 'text-gray-500'}`}>বাংলা</button>
            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-full ${lang === 'en' ? 'bg-white dark:bg-blue-900 shadow-sm text-blue-600' : 'text-gray-500'}`}>English</button>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button onClick={() => setIsAssistantOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <X className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA]" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-6 bg-white dark:bg-[#020617]">
          {chatHistory.length <= 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-[#007AFF]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#11241C] dark:text-white">
                  {lang === 'bn' ? 'নমস্কার! আমি JPG AI Assistant। জলপাইগুড়ি সম্পর্কে যেকোনো তথ্য খুঁজে পেতে আমি আপনাকে সাহায্য করতে পারি।' : 'How can I help you?'}
                </h2>
                <p className="text-sm text-[#55685F] dark:text-[#A2B3AA] max-w-xs">{lang === 'bn' ? 'আপনি কী জানতে চান?' : 'Ask about Jalpaiguri services, education, transport, jobs, healthcare and more.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                {quickChips.map((chip, i) => (
                  <button key={i} onClick={() => handleSend(chip.query)} className="px-4 py-2 bg-[#FAF8F5] dark:bg-blue-900/20 border border-[#E8E4DA] dark:border-white/5 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                    {chip.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#007AFF] text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-bl-none border border-red-200 dark:border-red-900/40'
                      : 'bg-gray-100 dark:bg-blue-900/20 text-[#11241C] dark:text-white rounded-bl-none border border-gray-200 dark:border-white/5'
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  {msg.isError && msg.failedQuery && (
                    <button
                      onClick={() => handleSend(msg.failedQuery, true)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                    </button>
                  )}
                </div>
                {msg.role === 'model' && !msg.isError && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 mt-2 px-1 max-w-[85%]"
                  >
                    <p className="w-full text-[10px] text-gray-500 mb-1">{lang === 'bn' ? 'আপনি আরও খুঁজতে পারেন' : 'You may also want to find'}</p>
                    {getSuggestions(msg.text).map((s, idx) => (
                      <button key={idx} onClick={() => handleSend(s)} className="px-3 py-1.5 bg-white dark:bg-blue-900/20 border border-gray-200 dark:border-white/10 rounded-full text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 shadow-sm transition-all hover:scale-105 active:scale-95">
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start items-center">
               <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-4 h-4 text-[#007AFF] animate-pulse" />
               </div>
               <div className="bg-gray-100 dark:bg-blue-900/20 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-sm border border-gray-200 dark:border-white/5">
                 <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-bounce [animation-delay:-0.3s]" />
                 <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-bounce [animation-delay:-0.15s]" />
                 <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-bounce" />
                 <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                   {lang === 'bn' ? 'উত্তর তৈরি হচ্ছে...' : 'Generating response...'}
                 </span>
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-sm border-t border-[#E8E4DA] dark:border-white/10">
          <div className="relative flex items-center gap-1 bg-gray-100 dark:bg-blue-900/20 rounded-full p-1 border border-gray-200 dark:border-white/10 focus-within:border-[#007AFF]">
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 transition-colors relative flex items-center justify-center ${isRecording ? 'text-red-500' : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#007AFF]'}`}
            >
              {isRecording ? (
                <div className="flex items-center justify-center gap-[2px] w-5 h-5">
                   <div style={{ height: `${Math.min(20, Math.max(4, audioLevel * 0.15))}px` }} className="w-1 bg-red-500 rounded-full transition-all duration-75" />
                   <div style={{ height: `${Math.min(20, Math.max(4, audioLevel * 0.3))}px` }} className="w-1 bg-red-500 rounded-full transition-all duration-75" />
                   <div style={{ height: `${Math.min(20, Math.max(4, audioLevel * 0.15))}px` }} className="w-1 bg-red-500 rounded-full transition-all duration-75" />
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <textarea
              placeholder={lang === 'bn' ? 'যেকোনো প্রশ্ন বা জলপাইগুড়ি সম্পর্কে জিজ্ঞাসা করুন...' : 'Ask any question or about Jalpaiguri...'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-transparent px-2 py-1.5 text-sm text-[#11241C] dark:text-white focus:outline-none resize-none overflow-hidden whitespace-nowrap"
              rows={1}
              disabled={loading}
            />
            <button
                onClick={() => handleSend()}
                disabled={!prompt.trim() || loading}
                className="p-2 rounded-full bg-[#007AFF] text-white hover:bg-[#0056b3] disabled:opacity-40 transition-all shadow-sm"
            >
                <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

