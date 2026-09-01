import React from 'react';
import { ArrowLeft, Search, Bell, Shield, Sparkles } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
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

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DA]/60 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            id="header-back-btn"
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
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
          <h1 className="text-lg font-bold text-[#11241C] tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center hover:bg-[#C8E6C9] active:scale-95 transition-all cursor-pointer"
          title="Ask Jalpaigi AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {showSearch && (
          <button
            onClick={onSearchClick}
            className="w-9 h-9 rounded-full bg-white border border-[#E8E4DA] text-[#11241C] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>
        )}

        {/* Switch to Admin Dashboard view toggle for easy inspection matching screenshot 5 */}
        <button
          onClick={() => navigate('admin-dashboard')}
          className="w-9 h-9 rounded-full bg-white border border-[#E8E4DA] text-[#063B2C] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
          title="Admin Verification Portal"
        >
          <Shield className="w-4 h-4 stroke-[2]" />
        </button>

        {rightAction}
      </div>
    </header>
  );
};
