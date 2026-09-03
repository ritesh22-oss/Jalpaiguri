import React from 'react';
import { ArrowLeft, Search, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { JalpaiguriLogo } from './JalpaiguriLogo';

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

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1713]/90 backdrop-blur-md border-b border-[#E8E4DA]/60 dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            id="header-back-btn"
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-[#E8ECE9] shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
        ) : showLogo ? (
          <div onClick={() => navigate('home')} className="cursor-pointer">
            <JalpaiguriLogo size="sm" />
          </div>
        ) : null}

        {title && (
          <h1 className="text-lg font-bold text-[#11241C] dark:text-[#E8ECE9] tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Theme Toggle Icon */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-amber-400 flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#55685F]" />}
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="w-9 h-9 rounded-full bg-[#E6F4EA] dark:bg-[#153426] text-[#063B2C] dark:text-[#4ECCA3] flex items-center justify-center hover:bg-[#C8E6C9] dark:hover:bg-[#1C4532] active:scale-95 transition-all cursor-pointer"
          title="Ask Jalpaigi AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {showSearch && (
          <button
            onClick={onSearchClick}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-[#11241C] dark:text-[#E8ECE9] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>
        )}

        {/* Switch to Admin Dashboard view toggle */}
        <button
          onClick={() => navigate('admin-dashboard')}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-[#063B2C] dark:text-[#4ECCA3] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          title="Admin Verification Portal"
        >
          <Shield className="w-4 h-4 stroke-[2]" />
        </button>

        {rightAction}
      </div>
    </header>
  );
};
