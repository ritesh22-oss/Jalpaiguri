import React, { useState } from 'react';
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
  UserPlus,
  Edit3,
  X,
  Check,
  Droplet,
  Shield,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';

export const ProfileView: React.FC = () => {
  const { user, logout, toggleRole, updateProfile } = useAuth();
  const { navigate } = useNav();
  const { civicReports, savedItemIds, language, setLanguage } = useApp();

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAge, setEditAge] = useState<number>(user?.age || 25);
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(user?.gender || 'Male');
  const [editBloodGroup, setEditBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'O+');
  const [editLocation, setEditLocation] = useState(user?.location || 'Kadamtala, Jalpaiguri');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isDonor, setIsDonor] = useState(user?.isBloodDonor || false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "I don't know"];

  const genderOptions = [
    { id: 'Male' as const, label: 'Male', symbol: '♂', bg: 'bg-blue-100 text-blue-700' },
    { id: 'Female' as const, label: 'Female', symbol: '♀', bg: 'bg-pink-100 text-pink-700' },
    { id: 'Other' as const, label: 'Other', symbol: '⚧', bg: 'bg-purple-100 text-purple-700' },
    { id: 'Prefer not to say' as const, label: 'Private', symbol: '🔒', bg: 'bg-slate-100 text-slate-700' }
  ];

  const handleOpenEdit = () => {
    if (user) {
      setEditName(user.name || '');
      setEditAge(user.age || 25);
      setEditGender(user.gender || 'Male');
      setEditBloodGroup(user.bloodGroup || 'O+');
      setEditLocation(user.location || 'Kadamtala, Jalpaiguri');
      setEditPhone(user.phone || '');
      setIsDonor(Boolean(user.isBloodDonor));
      setIsEditModalOpen(true);
      setSaveSuccess(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    if (updateProfile) {
      await updateProfile({
        name: editName.trim(),
        age: Number(editAge),
        gender: editGender,
        bloodGroup: editBloodGroup,
        location: editLocation.trim(),
        phone: editPhone.trim(),
        isBloodDonor: isDonor
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSaveSuccess(false);
    }, 800);
  };

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
          <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-3xl bg-[#063B2C] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#11241C] leading-tight">{user?.name}</h2>
                  <p className="text-xs font-semibold text-[#55685F] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                    <span>{user?.location || 'Jalpaiguri, WB'}</span>
                  </p>
                  {user?.phone && (
                    <p className="text-[11px] font-semibold text-[#8C9B93] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#55685F]" />
                      <span>{user.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={handleOpenEdit}
                className="py-1.5 px-3 rounded-2xl bg-[#FAF8F5] border border-[#D2CEBE] text-[#063B2C] hover:bg-[#E6F4EA] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                title="Edit Your Profile Manually"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Profile Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0ECE1]">
              <span className="text-[11px] font-bold text-[#D9383A] bg-[#FFEBEA] px-2.5 py-1 rounded-xl flex items-center gap-1">
                <Droplet className="w-3 h-3 fill-[#D9383A]" />
                <span>Blood: {user?.bloodGroup || 'O+'}</span>
              </span>

              {user?.age && (
                <span className="text-[11px] font-bold text-[#854D0E] bg-[#FEF9C3] px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Age: {user.age} yrs</span>
                </span>
              )}

              {user?.gender && (
                <span className="text-[11px] font-bold text-[#1E293B] bg-[#F1F5F9] px-2.5 py-1 rounded-xl">
                  {user.gender === 'Male' && '♂ Male'}
                  {user.gender === 'Female' && '♀ Female'}
                  {user.gender === 'Other' && '⚧ Other'}
                  {user.gender === 'Prefer not to say' && '🔒 Private'}
                </span>
              )}

              <span className="text-[11px] font-bold text-[#063B2C] bg-[#E6F4EA] px-2.5 py-1 rounded-xl flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Citizen</span>
              </span>
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
              Log in with your Google Account, Phone OTP, or Email to track requests, volunteer, and book local services.
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
                <h3 className="text-xs font-extrabold text-[#11241C]">Join as Worker / Offer Services</h3>
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
              onClick={handleOpenEdit}
              className="w-full py-3 bg-white border border-[#D2CEBE] text-[#063B2C] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FAF8F5] cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit My Profile Manually</span>
            </button>

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

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL                                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#063B2C]" />
                <h3 className="font-extrabold text-base text-[#11241C]">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#11241C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Age in Years */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#11241C] uppercase">
                    Age: <span className="text-[#063B2C]">{editAge} years</span>
                  </label>
                </div>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={editAge}
                  onChange={(e) => setEditAge(parseInt(e.target.value) || 18)}
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Gender with Icons */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1.5">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEditGender(opt.id)}
                      className={`p-2.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                        editGender === opt.id
                          ? 'bg-[#E6F4EA] border-[#063B2C] text-[#063B2C] font-extrabold shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#D2CEBE] text-[#55685F] font-bold hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold ${opt.bg}`}>
                          {opt.symbol}
                        </span>
                        <span className="text-xs">{opt.label}</span>
                      </div>
                      {editGender === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1.5">
                  Blood Group *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setEditBloodGroup(bg)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        editBloodGroup === bg
                          ? 'bg-[#FFEBEA] border-[#D9383A] text-[#D9383A]'
                          : 'bg-[#FAF8F5] border-[#D2CEBE] text-[#11241C] hover:bg-white'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                  Location / Ward in Jalpaiguri
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98320 XXXXX"
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Blood Donor Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFEBEA] border border-[#FECACA]">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#D9383A] fill-[#D9383A]" />
                  <span className="text-xs font-extrabold text-[#D9383A]">
                    Register as Emergency Blood Donor
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isDonor}
                  onChange={(e) => setIsDonor(e.target.checked)}
                  className="w-4 h-4 accent-[#D9383A] rounded-md cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-[#55685F] rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white rounded-2xl bg-[#063B2C] hover:bg-[#084D3A] shadow-md cursor-pointer active:scale-98 transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
