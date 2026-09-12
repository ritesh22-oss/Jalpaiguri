import React from 'react';
import { ArrowLeft, Search, Shield, Sparkles, Sun, Moon, Globe, Home } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { JPGLogo } from './JPGLogo';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  showSearch = false,
  onSearchClick,
  showLogo = false,
  rightAction
}) => {
  const { goBack, navigate, setIsAssistantOpen } = useNav();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, isBengali } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#020617]/90 backdrop-blur-md border-b border-[#E8E4DA]/60 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            id="header-back-btn"
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-[#F8FAFC] shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
        )}

        <button
          onClick={() => navigate('home')}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#007AFF] dark:text-blue-400 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all cursor-pointer"
          aria-label="Home"
          title="Return to Dashboard"
        >
          <Home className="w-5 h-5 stroke-[2.5]" />
        </button>

        {showLogo && !showBack && (
          <div onClick={() => navigate('home')} className="cursor-pointer ml-1">
            <JPGLogo size="sm" />
          </div>
        )}

        {title && (
          <h1 className="text-sm font-extrabold text-[#11241C] dark:text-[#F8FAFC] tracking-tight ml-1 truncate max-w-[120px] sm:max-w-none">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Language Switch Button */}
        <button
          id="header-lang-btn"
          onClick={toggleLanguage}
          className="h-9 px-2.5 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] flex items-center gap-1.5 shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          title={isBengali ? 'Switch to English' : 'বাংলায় দেখুন'}
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-semibold">{isBengali ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Quick Theme Toggle Icon */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-amber-400 flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#55685F]" />}
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] dark:text-[#38BDF8] flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-800/40 active:scale-95 transition-all cursor-pointer"
          title="Ask JPG AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {showSearch && (
          <button
            onClick={onSearchClick}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 text-[#11241C] dark:text-[#F8FAFC] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>
        )}

        {/* Switch to Admin Dashboard view toggle */}
        <button
          onClick={() => navigate('admin-dashboard')}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 text-[#007AFF] dark:text-[#38BDF8] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          title="Admin Verification Portal"
        >
          <Shield className="w-4 h-4 stroke-[2]" />
        </button>

        {rightAction}
      </div>
    </header>
  );
};
