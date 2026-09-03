import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Phone,
  Share2,
  AlertTriangle,
  Users,
  Settings,
  X,
  CheckCircle2,
  Radio,
  Clock,
  MapPin,
  Flame,
  Volume2,
  VolumeX,
  Info,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Smartphone,
  ShieldCheck,
  HeartHandshake,
  Play
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { useLocation } from '../../context/LocationContext';
import { ViewType, TrustedContact } from '../../types';

interface SafetySosViewProps {
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
}

export const SafetySosView: React.FC<SafetySosViewProps> = ({ onBack, onNavigate }) => {
  const {
    sosStatus,
    countdown,
    triggerSource,
    activeEvent,
    trustedContacts,
    safetySettings,
    shakeSupported,
    shakePermissionGranted,
    shakePermissionStatus,
    shakeCurrentCount,
    nearbyAlerts,
    initiateSosTrigger,
    confirmSos,
    cancelSosCountdown,
    cancelActiveSos,
    call112,
    shareEmergencyLocation,
    sendSmsToTrustedContacts,
    runTestSafetyAlert,
    exitTestMode,
    requestShakePermission,
    simulateShake,
    updateSafetySettings,
    addTrustedContact,
    removeTrustedContact
  } = useSafety();

  const { location } = useLocation();

  const [activeTab, setActiveTab] = useState<'sos' | 'contacts' | 'settings' | 'nearby'>('sos');

  // Hold-to-SOS button state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // New Contact Form Modal
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState<TrustedContact['relationship']>('Parent');

  // Cancel Reason Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('False alarm / Triggered by mistake');

  // Hold-to-activate handlers (1.5 seconds continuous hold)
  const startHold = () => {
    if (sosStatus === 'ACTIVE' || sosStatus === 'CONFIRMING') return;
    setHoldProgress(0);

    const stepMs = 30;
    const totalMs = 1500;
    const increment = (stepMs / totalMs) * 100;

    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev + increment >= 100) {
          clearInterval(holdIntervalRef.current!);
          holdIntervalRef.current = null;
          initiateSosTrigger('BUTTON');
          return 100;
        }
        return prev + increment;
      });
    }, stepMs);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    addTrustedContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelationship,
      isEmergencyAlertContact: true
    });

    setNewContactName('');
    setNewContactPhone('');
    setIsAddContactModalOpen(false);
  };

  const handleConfirmCancelSos = async () => {
    await cancelActiveSos(cancellationReason);
    setIsCancelModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1713] text-[#11241C] dark:text-[#E8ECE9] flex flex-col max-w-lg mx-auto pb-24 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#15211B]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] text-[#11241C] dark:text-[#E8ECE9] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-[#11241C] dark:text-white flex items-center gap-1.5">
              <span className="text-red-600">🆘</span> Safety SOS Hub
            </h1>
            <p className="text-[11px] font-semibold text-[#667085] dark:text-[#889B91]">
              Jalpaiguri Emergency & Responder Network
            </p>
          </div>
        </div>

        <button
          onClick={call112}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B42318] hover:bg-[#912018] text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>CALL 112</span>
        </button>
      </header>

      {/* Official Government Emergency Services Disclaimer */}
      <div className="bg-[#FFF4E5] dark:bg-amber-950/40 border-b border-[#FFE0B2] dark:border-amber-900/40 px-4 py-2.5 flex items-start gap-2 text-xs text-[#7A4100] dark:text-amber-200">
        <Info className="w-4 h-4 text-[#B76E00] dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="font-bold">Important Notice:</strong> Jalpaiguri Connect notifies selected trusted contacts and opted-in community responders. It <strong className="underline">does not replace official emergency services</strong>. For immediate danger, always call 112 directly.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white dark:bg-[#15211B] border-b border-[#E8E4DA] dark:border-white/10 px-4 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-bold transition-colors">
        <button
          onClick={() => setActiveTab('sos')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'sos'
              ? 'bg-[#063B2C] text-white dark:bg-emerald-600'
              : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
          }`}
        >
          🆘 SOS Control
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'contacts'
              ? 'bg-[#063B2C] text-white dark:bg-emerald-600'
              : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Trusted Contacts ({trustedContacts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#063B2C] text-white dark:bg-emerald-600'
              : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
        {safetySettings.nearbyAlertsEnabled && (
          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'nearby'
                ? 'bg-[#063B2C] text-white dark:bg-emerald-600'
                : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Community ({nearbyAlerts.length})</span>
          </button>
        )}
      </div>

      <main className="p-4 space-y-4 flex-1">
        {/* ========================================================= */}
        {/* ACTIVE SOS STATUS BANNER (When SOS is actively broadcasting) */}
        {/* ========================================================= */}
        {sosStatus === 'ACTIVE' && activeEvent && (
          <div className="bg-[#FEF3F2] border-2 border-[#FECDCA] rounded-3xl p-5 shadow-md space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D92D20] animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-[#B42318]">
                  EMERGENCY SOS IS ACTIVE
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#7A271A] bg-[#FEE4E2] px-2 py-0.5 rounded-md">
                Ref: {activeEvent.id}
              </span>
            </div>

            <div className="bg-white/90 rounded-2xl p-3.5 space-y-2 border border-[#FECDCA] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F]">Broadcast Location:</span>
                <span className="font-extrabold text-[#11241C] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D92D20]" />
                  {activeEvent.city || 'Jalpaiguri'}, {activeEvent.state || 'West Bengal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F]">Level 1 - Trusted Contacts:</span>
                <span className="font-bold text-[#063B2C] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#063B2C]" />
                  Dispatched ({trustedContacts.length} contacts)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F]">Level 2 - Nearby Community:</span>
                <span className="font-bold text-[#55685F]">
                  {activeEvent.alerts_sent_nearby ? '✓ Anonymous alert broadcast' : 'Disabled (Opt-in only)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={call112}
                className="py-3 px-3 rounded-2xl bg-[#D92D20] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call 112 Police</span>
              </button>

              <button
                onClick={shareEmergencyLocation}
                className="py-3 px-3 rounded-2xl bg-white border border-[#D2CEBE] text-[#11241C] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FAF8F5] active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#063B2C]" />
                <span>Share Location</span>
              </button>
            </div>

            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-white border border-[#FECDCA] text-[#B42318] font-bold text-xs hover:bg-[#FEE4E2] transition-colors cursor-pointer"
            >
              Cancel SOS (I am safe now)
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TEST SIMULATION MODE BANNER */}
        {/* ========================================================= */}
        {sosStatus === 'TEST_MODE' && (
          <div className="bg-[#FEFBE8] border-2 border-[#FDE047] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-wider uppercase text-[#854D0E] flex items-center gap-1.5">
                <span>🧪</span> TEST SIMULATION MODE ACTIVE
              </span>
              <button
                onClick={exitTestMode}
                className="text-xs font-bold text-[#854D0E] bg-[#FEF08A] px-2 py-0.5 rounded-full hover:bg-[#FDE047]"
              >
                Exit Test
              </button>
            </div>
            <p className="text-xs text-[#713F12] leading-relaxed">
              This is a safety test simulation. Device coordinates were verified and UI countdown demonstrated. <strong className="font-bold">No real emergency services or community members were contacted.</strong>
            </p>
            <div className="bg-white/80 rounded-2xl p-3 text-xs space-y-1">
              <p className="text-[#55685F]">Detected GPS: {location?.lat.toFixed(4)}°, {location?.lng.toFixed(4)}°</p>
              <p className="text-[#55685F]">Accuracy: ±{location?.accuracy || 20}m</p>
              <p className="text-[#063B2C] font-bold">✓ Simulation successfully verified</p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: SOS CONTROL HUB */}
        {/* ========================================================= */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            {/* Primary HOLD FOR SOS Button Container */}
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-6 shadow-xs text-center space-y-5 transition-colors">
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3F2] dark:bg-red-950/50 text-[#B42318] dark:text-red-400 border border-[#FECDCA] dark:border-red-900/50">
                  Primary Emergency Action
                </span>
                <h2 className="text-lg font-extrabold text-[#11241C] dark:text-white">
                  Hold Button for 1.5 Seconds
                </h2>
                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] max-w-xs mx-auto">
                  To prevent accidental triggers, press and firmly hold down the red button below.
                </p>
              </div>

              {/* Big Circular Hold-to-SOS Button with Radial Progress */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center select-none touch-none">
                {/* Progress SVG Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#FEE4E2"
                    strokeWidth="6"
                    className="dark:stroke-gray-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#D92D20"
                    strokeWidth="6"
                    strokeDasharray={283}
                    strokeDashoffset={283 - (283 * holdProgress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-75 ease-linear"
                  />
                </svg>

                {/* Main Interactive Button */}
                <button
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  onTouchCancel={endHold}
                  className={`w-38 h-38 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-transform cursor-pointer select-none ${
                    holdProgress > 0 ? 'scale-95 bg-[#991B1B]' : 'bg-[#D92D20] hover:bg-[#B91C1C]'
                  }`}
                  aria-label="Hold for SOS"
                >
                  <ShieldAlert className="w-10 h-10 mb-1" />
                  <span className="text-base font-black tracking-wider uppercase">
                    {holdProgress > 0 ? `${Math.round(holdProgress)}%` : 'HOLD FOR SOS'}
                  </span>
                  <span className="text-[10px] font-semibold text-white/80 mt-0.5">
                    1.5s Press & Hold
                  </span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => initiateSosTrigger('BUTTON')}
                  className="text-xs font-bold text-[#D92D20] dark:text-red-400 hover:underline"
                >
                  Tap for Immediate SOS Countdown
                </button>
              </div>
            </div>

            {/* Shake Phone Section */}
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#E6F4EA] dark:bg-[#1C4532] text-[#063B2C] dark:text-[#4ECCA3] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white flex items-center gap-1.5">
                      <span>Shake Phone 3 Times</span>
                      {safetySettings.shakeToSosEnabled && shakeSupported && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Sensor" />
                      )}
                    </h3>
                    <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                      Motion gesture emergency trigger
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => updateSafetySettings({ shakeToSosEnabled: !safetySettings.shakeToSosEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    safetySettings.shakeToSosEnabled ? 'bg-[#063B2C] dark:bg-emerald-600' : 'bg-[#D2CEBE] dark:bg-gray-700'
                  }`}
                  aria-label="Toggle Shake-to-SOS"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      safetySettings.shakeToSosEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 3-Shake Live Counter Progress */}
              {safetySettings.shakeToSosEnabled && (
                <div className="bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#11241C] dark:text-[#E8ECE9]">
                    <span className="text-[#55685F] dark:text-[#A2B3AA]">Shake Progress Tracker:</span>
                    <span className={shakeCurrentCount > 0 ? 'text-red-500 font-extrabold' : 'text-[#55685F] dark:text-[#A2B3AA]'}>
                      {shakeCurrentCount} / 3 Shakes
                    </span>
                  </div>

                  {/* 3 Step Visual Indicators */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((num) => {
                      const isReached = shakeCurrentCount >= num;
                      return (
                        <div
                          key={num}
                          className={`py-2 px-1 rounded-xl text-center text-xs font-extrabold border transition-all ${
                            isReached
                              ? 'bg-red-500 text-white border-red-600 shadow-sm scale-102 animate-pulse'
                              : 'bg-white dark:bg-[#17231E] text-[#55685F] dark:text-gray-400 border-[#E8E4DA] dark:border-white/10'
                          }`}
                        >
                          Shake {num}
                        </div>
                      );
                    })}
                  </div>

                  {/* Permission or Simulation Controls */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    {shakeSupported && !shakePermissionGranted && (
                      <button
                        onClick={requestShakePermission}
                        className="text-xs font-bold text-[#063B2C] dark:text-emerald-400 underline cursor-pointer"
                      >
                        Grant motion sensor permission
                      </button>
                    )}

                    <button
                      onClick={() => simulateShake()}
                      className="ml-auto px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C2C24] border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#063B2C] dark:text-emerald-300 hover:bg-[#E6F4EA] dark:hover:bg-[#233A2F] active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      title="Test motion detection logic without moving phone"
                    >
                      <span>Simulate Shake</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
                {shakeSupported ? (
                  <>
                    When enabled, vigorously shaking your phone 3 times triggers the emergency SOS countdown.
                    <span className="block text-[11px] text-[#8C9B93] dark:text-[#73857C] mt-1">
                      Note: In accordance with standard web browser security, Shake-to-SOS operates while the application is active in the foreground.
                    </span>
                  </>
                ) : (
                  <span className="text-[#D92D20] dark:text-red-400 font-semibold">
                    Shake-to-SOS isn't supported on this browser or device. The prominent 'HOLD FOR SOS' button remains fully available.
                  </span>
                )}
              </p>
            </div>

            {/* Quick Emergency Direct Call Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={call112}
                className="p-3.5 rounded-3xl bg-[#B42318] hover:bg-[#912018] text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call 112 (All Emergency)</span>
              </button>

              <button
                onClick={() => { window.location.href = 'tel:1091'; }}
                className="p-3.5 rounded-3xl bg-[#FAF8F5] dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#D92D20]" />
                <span>Call 1091 (Women Helpline)</span>
              </button>
            </div>

            {/* Dedicated Sexual Violence & Assault Support Link Card */}
            <div
              onClick={() => onNavigate('sexual-violence-support')}
              className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 hover:border-[#063B2C] dark:hover:border-emerald-500 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] dark:bg-red-950/40 text-[#D92D20] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    🛡️ Sexual Violence & Assault Support
                  </h4>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                    Immediate safety, medical triage, legal aid, private diary
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#8C9B93]" />
            </div>

            {/* Simulation / Test Safety Alert Card */}
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA] uppercase tracking-wider">
                  Developer & User Verification
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FEF9C3] dark:bg-amber-950/60 text-[#854D0E] dark:text-amber-300 font-bold text-[10px]">
                  Simulation Only
                </span>
              </div>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Test your phone's GPS detection, UI countdown, and sound alerts without notifying real people or emergency services.
              </p>
              <button
                onClick={runTestSafetyAlert}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
                <span>Run Simulated Safety Test</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TRUSTED CONTACTS */}
        {/* ========================================================= */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                  Emergency Contacts ({trustedContacts.length})
                </h3>
                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                  Notified automatically with your approximate location if SOS is activated
                </p>
              </div>
              <button
                onClick={() => setIsAddContactModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-[#084D3A] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of Contacts */}
            <div className="space-y-2.5">
              {trustedContacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#E5E1D5] dark:border-white/10 text-[#063B2C] dark:text-[#4ECCA3] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                          {c.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#063B2C] dark:text-[#4ECCA3] bg-[#E6F4EA] dark:bg-[#1C4532] px-2 py-0.5 rounded-full">
                          {c.relationship}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                        {c.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeTrustedContact(c.id)}
                    className="p-2 text-[#8C9B93] hover:text-[#D92D20] transition-colors cursor-pointer"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {trustedContacts.length === 0 && (
                <div className="bg-white dark:bg-[#17231E] border border-dashed border-[#D2CEBE] dark:border-white/15 rounded-3xl p-6 text-center space-y-2">
                  <Users className="w-8 h-8 text-[#8C9B93] mx-auto" />
                  <p className="text-sm font-bold text-[#11241C] dark:text-white">No Trusted Contacts Added</p>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                    Add at least one family member or close friend to receive immediate notifications.
                  </p>
                  <button
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs rounded-2xl"
                  >
                    Add First Contact
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={sendSmsToTrustedContacts}
              className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
              <span>Test SMS to First Contact</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SAFETY SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4 divide-y divide-[#E8E4DA] dark:divide-white/10 transition-colors">
              {/* Setting 1: Instant SOS */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    Instant SOS (Skip Countdown)
                  </h4>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    {safetySettings.instantSosEnabled
                      ? 'SOS broadcasts immediately without the 5s false-alarm countdown.'
                      : 'Recommended: 5-second countdown provides protection against accidental triggers.'}
                  </p>
                </div>
                <button
                  onClick={() => updateSafetySettings({ instantSosEnabled: !safetySettings.instantSosEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                    safetySettings.instantSosEnabled ? 'bg-[#D92D20]' : 'bg-[#D2CEBE] dark:bg-gray-700'
                  }`}
                  aria-label="Toggle Instant SOS"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      safetySettings.instantSosEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 2: Shake Phone */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    Shake-to-SOS
                  </h4>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    Detect sequence of 3 rapid shakes while app is open.
                  </p>
                </div>
                <button
                  onClick={() => updateSafetySettings({ shakeToSosEnabled: !safetySettings.shakeToSosEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                    safetySettings.shakeToSosEnabled ? 'bg-[#063B2C] dark:bg-emerald-600' : 'bg-[#D2CEBE] dark:bg-gray-700'
                  }`}
                  aria-label="Toggle Shake-to-SOS"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      safetySettings.shakeToSosEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 3: Alarm Sound */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    Emergency Notification Tone
                  </h4>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    Audible tone during countdown and activation.
                  </p>
                </div>
                <button
                  onClick={() => updateSafetySettings({ emergencyNotificationSound: !safetySettings.emergencyNotificationSound })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                    safetySettings.emergencyNotificationSound ? 'bg-[#063B2C] dark:bg-emerald-600' : 'bg-[#D2CEBE] dark:bg-gray-700'
                  }`}
                  aria-label="Toggle Notification Sound"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      safetySettings.emergencyNotificationSound ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 4: Nearby Community Safety Network (Opt-In) */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white flex items-center gap-1.5">
                      <span>Nearby Safety Network</span>
                      <span className="text-[10px] font-black uppercase text-[#063B2C] dark:text-[#4ECCA3] bg-[#E6F4EA] dark:bg-[#1C4532] px-2 py-0.5 rounded-full">
                        Opt-In
                      </span>
                    </h4>
                    <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                      Receive and dispatch anonymous emergency alerts with nearby community members.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSafetySettings({ nearbyAlertsEnabled: !safetySettings.nearbyAlertsEnabled })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                      safetySettings.nearbyAlertsEnabled ? 'bg-[#063B2C] dark:bg-emerald-600' : 'bg-[#D2CEBE] dark:bg-gray-700'
                    }`}
                    aria-label="Toggle Nearby Community Alerts"
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        safetySettings.nearbyAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {safetySettings.nearbyAlertsEnabled && (
                  <div className="bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#E5E1D5] dark:border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#55685F] dark:text-[#A2B3AA]">Proximity Alert Radius:</span>
                      <span className="text-[#063B2C] dark:text-[#4ECCA3]">{safetySettings.nearbyAlertRadiusKm} km</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([0.5, 1, 2, 5] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => updateSafetySettings({ nearbyAlertRadiusKm: r })}
                          className={`py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            safetySettings.nearbyAlertRadiusKm === r
                              ? 'bg-[#063B2C] dark:bg-emerald-600 text-white'
                              : 'bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
                          }`}
                        >
                          {r < 1 ? `${r * 1000}m` : `${r}km`}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#8C9B93] dark:text-[#73857C] leading-relaxed pt-1">
                      🔒 <strong className="font-semibold">Privacy Guarantee:</strong> Nearby alerts only show the approximate neighborhood or ward. Your exact GPS coordinates, phone number, name, and profile are never disclosed to community responders.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: NEARBY COMMUNITY ALERTS (Opted-in only) */}
        {/* ========================================================= */}
        {activeTab === 'nearby' && safetySettings.nearbyAlertsEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                Nearby Community Alerts ({nearbyAlerts.length})
              </h3>
              <span className="text-[11px] text-[#063B2C] dark:text-[#4ECCA3] font-bold bg-[#E6F4EA] dark:bg-[#1C4532] px-2 py-0.5 rounded-full">
                Within {safetySettings.nearbyAlertRadiusKm}km
              </span>
            </div>

            <div className="space-y-2.5">
              {nearbyAlerts.map((alert) => (
                <div
                  key={alert.eventId}
                  className="bg-white dark:bg-[#17231E] border border-[#FECDCA] dark:border-red-900/50 rounded-3xl p-4 shadow-xs space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#D92D20] dark:text-red-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      Anonymous Emergency Alert
                    </span>
                    <span className="text-[11px] font-semibold text-[#8C9B93] dark:text-[#73857C]">
                      {alert.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#11241C] dark:text-white">
                    Approximate Area: {alert.approximateArea}
                  </p>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                    {alert.anonymousNotice}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-[#B42318] dark:text-red-400 font-bold">
                      {alert.urgentActionNotice}
                    </span>
                    <button
                      onClick={call112}
                      className="px-2.5 py-1 bg-[#D92D20] text-white font-bold text-[11px] rounded-lg"
                    >
                      Call 112
                    </button>
                  </div>
                </div>
              ))}

              {nearbyAlerts.length === 0 && (
                <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-6 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-[#063B2C] dark:text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-[#11241C] dark:text-white">No Active Emergency Alerts</p>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                    There are no active community safety broadcasts in your designated area.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* FALSE-ALARM PROTECTION COUNTDOWN MODAL */}
      {/* ========================================================= */}
      {sosStatus === 'CONFIRMING' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl p-6 w-full max-w-sm text-center space-y-6 shadow-2xl border-2 border-[#D92D20] animate-in fade-in zoom-in-95 transition-colors">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#D92D20] dark:text-red-400">
                {triggerSource === 'SHAKE' ? 'Motion Gesture Detected' : 'Emergency Triggered'}
              </span>
              <h2 className="text-2xl font-black text-[#11241C] dark:text-white">
                Are you in danger?
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                SOS will broadcast to your contacts and emergency network in:
              </p>
            </div>

            {/* Countdown Display */}
            <div className="w-28 h-28 rounded-full bg-[#FEF3F2] dark:bg-red-950/40 border-4 border-[#D92D20] mx-auto flex items-center justify-center shadow-inner">
              <span className="text-5xl font-black text-[#D92D20] dark:text-red-400 font-mono animate-bounce">
                {countdown}
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={confirmSos}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#D92D20] hover:bg-[#B91C1C] text-white font-extrabold text-sm shadow-md active:scale-98 cursor-pointer"
              >
                SEND SOS NOW
              </button>

              <button
                onClick={cancelSosCountdown}
                className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-extrabold text-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
              >
                Cancel (False Alarm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD TRUSTED CONTACT MODAL */}
      {/* ========================================================= */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-[#E8E4DA] dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">
                Add Trusted Contact
              </h3>
              <button
                onClick={() => setIsAddContactModalOpen(false)}
                className="p-1 rounded-full text-[#8C9B93] hover:text-[#11241C] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#11241C] dark:text-[#E8ECE9] block mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mother, Father, Friend"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D2CEBE] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#131F1A] font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#11241C] dark:text-[#E8ECE9] block mb-1">
                  Mobile Number (SMS Enabled)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98320 00000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D2CEBE] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#131F1A] font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#11241C] dark:text-[#E8ECE9] block mb-1">
                  Relationship
                </label>
                <select
                  value={newContactRelationship}
                  onChange={(e) => setNewContactRelationship(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D2CEBE] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#131F1A] font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold hover:bg-[#084D3A]"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CANCEL SOS REASON MODAL */}
      {/* ========================================================= */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-[#E8E4DA] dark:border-white/10 transition-colors">
            <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">
              Cancel Emergency SOS
            </h3>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
              Confirm that you are safe. This updates the backend log and informs your emergency recipients.
            </p>

            <div className="space-y-2 text-xs">
              {[
                'False alarm / Triggered by mistake',
                'Emergency resolved safely',
                'Official assistance arrived',
                'Testing device functionality'
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors ${
                    cancellationReason === reason
                      ? 'border-[#063B2C] dark:border-emerald-500 bg-[#E6F4EA] dark:bg-[#1C4532]'
                      : 'border-[#E8E4DA] dark:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancellationReason === reason}
                    onChange={() => setCancellationReason(reason)}
                    className="accent-[#063B2C]"
                  />
                  <span className="font-bold text-[#11241C] dark:text-white">{reason}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="w-1/2 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA] text-xs"
              >
                Keep SOS Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelSos}
                className="w-1/2 py-2.5 rounded-2xl bg-[#D92D20] text-white font-bold text-xs hover:bg-[#B91C1C]"
              >
                Confirm Cancel SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
