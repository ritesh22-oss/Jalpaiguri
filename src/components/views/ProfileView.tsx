import React from 'react';
import {
  User,
  MapPin,
  Heart,
  ShieldCheck,
  Globe,
  LogOut,
  ChevronRight,
  FileSpreadsheet,
  Wrench,
  Sparkles,
  LayoutDashboard,
  LogIn,
  Phone,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { user, logout, toggleRole, updateProfile } = useAuth();
  const { navigate } = useNav();
  const { civicReports, savedItemIds, language, setLanguage } = useApp();

  const handleLanguageChange = (lang: 'en' | 'bn') => {
    setLanguage(lang);
    if (updateProfile) {
      updateProfile({ language: lang === 'en' ? 'English' : 'বাংলা' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('auth');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-5 pt-6 pb-3 border-b border-[#E8E4DA]/50 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
          Citizen Profile
        </h1>
        {user ? (
          <button
            onClick={toggleRole}
            className="text-xs font-bold text-[#063B2C] bg-[#E6F4EA] px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{user?.role === 'admin' ? 'Switch to User' : 'Admin Panel'}</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('auth')}
            className="text-xs font-bold text-white bg-[#063B2C] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </header>

      <div className="p-5 space-y-5">
        {/* User Card OR Guest Card */}
        {user ? (
          <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#063B2C] text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
              {user?.name ? user.name.charAt(0) : 'J'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-[#11241C] truncate">{user?.name}</h2>
              <p className="text-xs font-semibold text-[#55685F] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                <span>{user?.location || 'Jalpaiguri, WB'}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-[#D9383A] bg-[#FFEBEA] px-2 py-0.5 rounded-md">
                  Blood: {user?.bloodGroup || 'O+'}
                </span>
                <span className="text-[10px] font-bold text-[#063B2C] bg-[#E6F4EA] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Citizen</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#063B2C] to-[#0A5641] text-white rounded-3xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-[#A7D7B9]">
                Guest Mode
              </span>
              <span className="text-xs text-white/80">Jalpaiguri Connect</span>
            </div>
            <h2 className="text-lg font-black leading-tight">
              Sign In to unlock full civic services
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Log in with your Mobile OTP, Google Account, or Email to track requests, volunteer, and book local services.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate('auth')}
                className="flex-1 bg-white text-[#063B2C] font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs hover:bg-[#FAF8F5] cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Menu Options */}
        <div className="bg-white rounded-3xl border border-[#E8E4DA] shadow-xs divide-y divide-[#F0ECE1] overflow-hidden">
          <div
            onClick={() => navigate('report-tracking')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C]">My Civic Reports</h3>
                <p className="text-[11px] text-[#55685F]">{civicReports.length} reported issues</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          <div
            onClick={() => navigate('offer-services')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C]">Offer Your Services</h3>
                <p className="text-[11px] text-[#55685F]">Register as electrician, plumber, etc.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          <div
            onClick={() => navigate('blood')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFEBEA] text-[#D9383A] flex items-center justify-center">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C]">Blood Donor Network</h3>
                <p className="text-[11px] text-[#55685F]">Active Donor Hub • {user?.bloodGroup || 'All Groups'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#55685F]" />
            <span className="text-xs font-bold text-[#11241C]">Language / ভাষা</span>
          </div>
          <div className="flex gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#D2CEBE]">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                language === 'en' ? 'bg-[#063B2C] text-white' : 'text-[#55685F]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('bn')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                language === 'bn' ? 'bg-[#063B2C] text-white' : 'text-[#55685F]'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Authentication Actions */}
        {user ? (
          <div className="space-y-2">
            <button
              onClick={() => navigate('auth')}
              className="w-full py-3 bg-white border border-[#D2CEBE] text-[#063B2C] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FAF8F5] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Switch / Sign into Another Account</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white border border-[#D9383A]/30 text-[#D9383A] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FFEBEA] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Jalpaiguri Connect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('auth')}
            className="w-full py-3.5 bg-[#063B2C] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-[#084D3A] active:scale-98 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Open Sign In / Sign Up Page</span>
          </button>
        )}
      </div>
    </div>
  );
};
