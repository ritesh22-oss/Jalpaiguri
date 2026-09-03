import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { FAQ_DATA, FAQ_CATEGORIES, FAQCategory, FAQItem } from '../../data/faqData';

export const FAQView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { isDarkMode } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | FAQCategory>('All');
  const [openItemId, setOpenItemId] = useState<string | null>('faq-gs-1'); // first open by default
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Filtered FAQ questions based on search & category
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inQuestion = item.question.toLowerCase().includes(q);
      const inAnswer = item.answer.toLowerCase().includes(q);
      const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));

      return inQuestion || inAnswer || inKeywords;
    });
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`min-h-screen pb-28 max-w-md mx-auto select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0E1714] text-[#E6EFEA]' : 'bg-[#FAF8F5] text-[#11241C]'
      }`}
    >
      {/* Sticky Header */}
      <header
        className={`sticky top-0 z-30 px-5 pt-6 pb-3.5 border-b backdrop-blur-md transition-colors ${
          isDarkMode
            ? 'bg-[#0E1714]/90 border-[#1F332B]'
            : 'bg-[#FAF8F5]/90 border-[#E8E4DA]/70'
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => goBack()}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-[#182620] text-emerald-300 hover:bg-[#20332B]'
                : 'bg-white border border-[#E8E4DA] text-[#063B2C] hover:bg-[#F2EFE9]'
            }`}
            title="Back to Profile"
            aria-label="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">FAQ</h1>
            <p className="text-[11px] opacity-70">Help & Knowledge Center</p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
            isDarkMode
              ? 'bg-[#182620] border-[#254236] text-emerald-300'
              : 'bg-[#E6F4EA] border-[#C3E6D0] text-[#063B2C]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>v1.0.0</span>
        </div>
      </header>

      <div className="p-5 space-y-5">
        {/* Hero Section */}
        <div
          className={`p-4 rounded-3xl border transition-colors ${
            isDarkMode
              ? 'bg-[#13201B] border-[#1F352C]'
              : 'bg-white border-[#E8E4DA] shadow-xs'
          }`}
        >
          <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs opacity-75 mt-1 leading-relaxed">
            Everything you need to know about using Jalpaiguri Connect, finding local services,
            emergency help, and navigating official government portals safely.
          </p>

          {/* Search Input */}
          <div className="relative mt-3.5">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your question (e.g. birth certificate, electrician, blood)..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs font-medium border outline-hidden transition-all ${
                isDarkMode
                  ? 'bg-[#0E1714] border-[#254236] focus:border-emerald-400 text-white placeholder:text-gray-500'
                  : 'bg-[#FAF8F5] border-[#D2CEBE] focus:border-[#063B2C] text-[#11241C] placeholder:text-[#8C9B93]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {FAQ_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'bg-[#063B2C] text-white shadow-xs'
                    : isDarkMode
                    ? 'bg-[#182620] text-gray-300 border border-[#254236] hover:bg-[#20332B]'
                    : 'bg-white text-[#55685F] border border-[#E8E4DA] hover:bg-[#FAF8F5]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Question Counter & Active Filter Badge */}
        <div className="flex items-center justify-between text-xs px-1 font-semibold opacity-70">
          <span>
            Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
          </span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-emerald-500 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {/* Accordion Questions List */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-3">
            {filteredFAQs.map((item: FAQItem) => {
              const isOpen = openItemId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isDarkMode
                      ? isOpen
                        ? 'bg-[#13201B] border-emerald-500/40 shadow-xs'
                        : 'bg-[#101B16] border-[#1F332B] hover:border-[#2F4F42]'
                      : isOpen
                      ? 'bg-white border-[#063B2C]/40 shadow-xs'
                      : 'bg-white border-[#E8E4DA] hover:border-[#D2CEBE]'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1 pr-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isDarkMode
                              ? 'bg-[#1F332B] text-emerald-300'
                              : 'bg-[#F0ECE1] text-[#063B2C]'
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[10px] opacity-60">Verified {item.lastUpdated}</span>
                      </div>
                      <h3 className="text-xs font-bold leading-snug pt-0.5">{item.question}</h3>
                    </div>
                    <div
                      className={`p-1 rounded-full shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-500' : 'opacity-60'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className={`px-4 pb-4 pt-1 text-xs leading-relaxed border-t transition-colors ${
                        isDarkMode
                          ? 'border-[#1F332B] text-gray-300 bg-[#0E1714]/40'
                          : 'border-[#F2EFE9] text-[#42524A] bg-[#FAF8F5]/60'
                      }`}
                    >
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div
            className={`p-8 text-center rounded-3xl border ${
              isDarkMode ? 'bg-[#13201B] border-[#1F352C]' : 'bg-white border-[#E8E4DA]'
            }`}
          >
            <HelpCircle className="w-10 h-10 mx-auto opacity-40 mb-3" />
            <h3 className="font-extrabold text-sm mb-1">No matching questions found</h3>
            <p className="text-xs opacity-75 max-w-xs mx-auto mb-4">
              We couldn't find any questions matching "{searchQuery}". Try searching for keywords
              like "trade license", "doctor", "blood", or "hospital".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-[#063B2C] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#084D3A] cursor-pointer"
            >
              Clear Search & Show All
            </button>
          </div>
        )}

        {/* Footer Support Section */}
        <div
          className={`p-5 rounded-3xl border space-y-3.5 transition-colors ${
            isDarkMode
              ? 'bg-[#13201B] border-[#1F352C]'
              : 'bg-white border-[#E8E4DA] shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider">
              Didn't find your answer?
            </h3>
          </div>
          <p className="text-xs opacity-75 leading-relaxed">
            Our civic community support team and citizen desk are available to assist with inquiries
            and portal navigation issues.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => setContactModalOpen(true)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#182620] border-[#254236] text-white hover:bg-[#20332B]'
                  : 'bg-[#FAF8F5] border-[#D2CEBE] text-[#063B2C] hover:bg-[#F2EFE9]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </button>

            <button
              onClick={() => navigate('report-problem')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 text-white transition-colors cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-[#063B2C] hover:bg-[#084D3A]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report a Problem</span>
            </button>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-300 dark:border-gray-800 text-center space-y-1">
            <p className="text-[11px] font-bold text-gray-500">
              Jalpaiguri Connect Version 1.0.0 (Build 2024.09)
            </p>
            <p className="text-[10px] opacity-60 max-w-xs mx-auto">
              Information may change as government guidelines and official departments update their
              digital portals.
            </p>
          </div>
        </div>
      </div>

      {/* Support Info Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-[#13201B] border-[#1F352C] text-white' : 'bg-white border-[#E8E4DA]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm">Citizen Support Desk</h3>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs opacity-85 leading-relaxed">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#182620] border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="font-bold block text-[11px] text-emerald-600 dark:text-emerald-400 uppercase">
                  Email Inquiries
                </span>
                <p className="font-mono text-xs">support@jalpaiguriconnect.org</p>
                <p className="text-[10px] opacity-70">Mon – Sat: 9:00 AM – 6:00 PM</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#182620] border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="font-bold block text-[11px] text-emerald-600 dark:text-emerald-400 uppercase">
                  Jalpaiguri Municipal Helpdesk
                </span>
                <p className="font-mono text-xs">03561-230045 / 222111</p>
                <p className="text-[10px] opacity-70">
                  Municipal Building, DBC Road, Jalpaiguri - 735101
                </p>
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Never share bank OTPs or confidential certificate passwords with anyone. Support
                  staff will never ask for payment.
                </span>
              </div>
            </div>

            <button
              onClick={() => setContactModalOpen(false)}
              className="w-full py-2.5 bg-[#063B2C] text-white font-bold text-xs rounded-xl hover:bg-[#084D3A] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
