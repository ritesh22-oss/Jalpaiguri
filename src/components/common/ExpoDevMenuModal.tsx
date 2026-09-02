import React from 'react';
import {
  X,
  RefreshCw,
  Smartphone,
  Bell,
  Volume2,
  VolumeX,
  UserCheck,
  Shield,
  Zap,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useExpo } from '../../context/ExpoContext';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { UserProfile } from '../../types';

export const ExpoDevMenuModal: React.FC = () => {
  const {
    isDevMenuOpen,
    setDevMenuOpen,
    deviceType,
    setDeviceType,
    isSoundEnabled,
    toggleSound,
    triggerPushNotification,
    triggerHaptic,
    setLatestOtp,
    requestAutoFill
  } = useExpo();

  const { completeUserProfile, logout } = useAuth();
  const { replaceView } = useNav();

  if (!isDevMenuOpen) return null;

  const handleSimulateOtpNotification = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setLatestOtp(randomOtp);
    triggerPushNotification({
      appTitle: 'Messages',
      category: 'SMS',
      title: 'Jalpaiguri Connect Verification',
      body: `Your verification code is ${randomOtp}. Do not share this code.`,
      code: randomOtp,
      actionLabel: 'Auto-Fill OTP',
      onAction: (code) => {
        if (code) requestAutoFill(code);
      }
    });
    setDevMenuOpen(false);
  };

  const handleSimulateAlertNotification = () => {
    triggerPushNotification({
      appTitle: 'Jalpaiguri Connect',
      category: 'ALERT',
      title: 'Waterlogging Alert • Kadamtala',
      body: 'Heavy monsoon rainfall near railway crossing. Traffic diverted via Club Road.',
      actionLabel: 'View Alert',
      onAction: () => replaceView('alerts')
    });
    setDevMenuOpen(false);
  };

  const handleFastLoginAs = async (role: 'citizen' | 'worker' | 'donor' | 'admin') => {
    let mockProfile: Partial<UserProfile>;
    if (role === 'admin') {
      mockProfile = {
        name: 'Debojyoti Sen (DM Office)',
        phone: '+91 98320 11234',
        location: 'Collectorate Compound, Jalpaiguri',
        bloodGroup: 'B+',
        role: 'admin',
        language: 'English'
      };
    } else if (role === 'worker') {
      mockProfile = {
        name: 'Subir Roy (Master Electrician)',
        phone: '+91 94340 55678',
        location: 'Kadamtala, Jalpaiguri',
        bloodGroup: 'O+',
        role: 'citizen',
        language: 'বাংলা'
      };
    } else if (role === 'donor') {
      mockProfile = {
        name: 'Dr. Priya Dasgupta',
        phone: '+91 98321 99887',
        location: 'Hakimpara, Jalpaiguri',
        bloodGroup: 'AB+',
        isBloodDonor: true,
        role: 'citizen',
        language: 'English'
      };
    } else {
      mockProfile = {
        name: 'Sourav Banerjee',
        phone: '+91 98765 43210',
        location: 'Mohitnagar, Jalpaiguri',
        bloodGroup: 'O+',
        role: 'citizen',
        language: 'English'
      };
    }

    await completeUserProfile(mockProfile);
    triggerHaptic('success');
    setDevMenuOpen(false);
    if (role === 'admin') {
      replaceView('admin-dashboard');
    } else {
      replaceView('home');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
              EX
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">Expo Developer Menu</h3>
              <p className="text-[10px] text-gray-500 font-mono">exp://jalpaiguri-connect.local</p>
            </div>
          </div>

          <button
            onClick={() => {
              setDevMenuOpen(false);
              triggerHaptic('light');
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions List */}
        <div className="py-3 space-y-2 max-h-[75vh] overflow-y-auto">
          {/* Reload View */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              window.location.reload();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-[0.99] text-xs font-semibold text-gray-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-gray-600" />
              <span>Reload JavaScript Bundle</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">⌘R</span>
          </button>

          {/* Test Push Notifications */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
            <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Expo Push Notifications</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleSimulateOtpNotification}
                className="py-2 px-2.5 rounded-xl bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Test SMS OTP</span>
              </button>

              <button
                onClick={handleSimulateAlertNotification}
                className="py-2 px-2.5 rounded-xl bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <Bell className="w-3 h-3 text-blue-600" />
                <span>Civic Alert</span>
              </button>
            </div>
          </div>

          {/* Device Frame Switcher */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1.5">
            <p className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-gray-600" />
              <span>Device Frame Simulator</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'iphone-16-pro', label: 'iPhone 16 Pro' },
                  { id: 'pixel-9', label: 'Google Pixel 9' },
                  { id: 'compact', label: 'Native Mobile' },
                  { id: 'fullscreen', label: 'Fullscreen' }
                ] as const
              ).map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setDeviceType(frame.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                    deviceType === frame.id
                      ? 'bg-black text-white font-bold shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{frame.label}</span>
                  {deviceType === frame.id && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Fast Test Profiles Switcher */}
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
            <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Test Profile Switcher</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleFastLoginAs('citizen')}
                className="py-1.5 px-2 bg-white rounded-xl border border-emerald-200 text-gray-800 text-[11px] font-medium hover:bg-emerald-50 cursor-pointer text-left"
              >
                👤 Citizen User
              </button>
              <button
                onClick={() => handleFastLoginAs('donor')}
                className="py-1.5 px-2 bg-white rounded-xl border border-emerald-200 text-gray-800 text-[11px] font-medium hover:bg-emerald-50 cursor-pointer text-left"
              >
                🩸 Blood Donor
              </button>
              <button
                onClick={() => handleFastLoginAs('worker')}
                className="py-1.5 px-2 bg-white rounded-xl border border-emerald-200 text-gray-800 text-[11px] font-medium hover:bg-emerald-50 cursor-pointer text-left"
              >
                ⚡ Electrician
              </button>
              <button
                onClick={() => handleFastLoginAs('admin')}
                className="py-1.5 px-2 bg-white rounded-xl border border-emerald-200 text-emerald-900 text-[11px] font-bold hover:bg-emerald-50 cursor-pointer text-left"
              >
                🏛️ Municipal Admin
              </button>
            </div>
          </div>

          {/* Sound & Haptic Toggle */}
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-[0.99] text-xs font-semibold text-gray-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
              <span>Expo Audio Chimes & Sound FX</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSoundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isSoundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Reset App / Clear Storage */}
          <button
            onClick={async () => {
              triggerHaptic('error');
              localStorage.clear();
              await logout();
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Cache & Restart Onboarding</span>
          </button>
        </div>
      </div>
    </div>
  );
};
