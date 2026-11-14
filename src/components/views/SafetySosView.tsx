import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  MapPin,
  Volume2,
  VolumeX,
  Info,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Smartphone,
  ShieldCheck,
  Play,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { useLocation } from '../../context/LocationContext';
import { ViewType, TrustedContact } from '../../types';

interface SafetySosViewProps {
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
}

const HOLD_DURATION_MS = 1500;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const SafetySosView: React.FC<SafetySosViewProps> = ({ onBack, onNavigate }) => {
  const {
    sosState,
    sosError,
    isTestMode,
    countdown,
    triggerSource,
    activeEvent,
    trustedContacts,
    safetySettings,
    shakeSupported,
    shakePermissionGranted,
    shakeCurrentCount,
    nearbyAlerts,
    startPressHold,
    cancelPressHold,
    completeHoldActivation,
    confirmSos,
    retrySendSos,
    cancelSosCountdown,
    dismissSosFeedback,
    cleanupTransientSosState,
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

  // Unified pointer/keyboard 1.5s press-and-hold state
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdHint, setHoldHint] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const activeKeyRef = useRef<string | null>(null);
  const buttonBoundsRef = useRef<{ cx: number; cy: number; maxRadius: number } | null>(null);
  const hintTimerRef = useRef<number | null>(null);

  // New Contact Form Modal
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] =
    useState<TrustedContact['relationship']>('Parent');

  // Cancel Reason Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState(
    'False alarm / Triggered by mistake'
  );

  const showTemporaryHint = useCallback((message: string) => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setHoldHint(message);
    hintTimerRef.current = window.setTimeout(() => {
      setHoldHint(null);
      hintTimerRef.current = null;
    }, 2600);
  }, []);

  const stopHoldLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    isHoldingRef.current = false;
    activePointerIdRef.current = null;
    activeKeyRef.current = null;
    buttonBoundsRef.current = null;
  }, []);

  const abortHold = useCallback(
    (reasonMessage?: string) => {
      const wasHolding = isHoldingRef.current;
      stopHoldLoop();
      setHoldProgress(0);
      if (wasHolding) {
        cancelPressHold();
        if (reasonMessage) {
          showTemporaryHint(reasonMessage);
        }
      }
    },
    [cancelPressHold, showTemporaryHint, stopHoldLoop]
  );

  const beginHoldSession = useCallback(() => {
    if (isHoldingRef.current) return false;
    if (
      sosState === 'COUNTDOWN' ||
      sosState === 'CONFIRMED' ||
      sosState === 'SENDING' ||
      sosState === 'SENT' ||
      isTestMode
    ) {
      return false;
    }

    const accepted = startPressHold();
    if (!accepted) return false;

    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setHoldHint(null);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore vibration failure
      }
    }

    isHoldingRef.current = true;
    holdStartTimeRef.current = performance.now();
    setHoldProgress(1);

    const tick = (now: number) => {
      if (!isHoldingRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);

      if (elapsed >= HOLD_DURATION_MS) {
        stopHoldLoop();
        setHoldProgress(0);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([80, 40, 80]);
          } catch {
            // Ignore vibration failure
          }
        }
        completeHoldActivation();
        return;
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
    return true;
  }, [completeHoldActivation, isTestMode, sosState, startPressHold, stopHoldLoop]);

  // Pointer handlers (mouse, touch, stylus — unified, zero duplicate mouse+touch events)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (activePointerIdRef.current !== null || isHoldingRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    buttonBoundsRef.current = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      maxRadius: Math.max(rect.width, rect.height) / 2 + 28
    };

    const started = beginHoldSession();
    if (!started) {
      buttonBoundsRef.current = null;
      return;
    }

    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Some synthetic environments may not support pointer capture
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isHoldingRef.current || activePointerIdRef.current !== e.pointerId) return;
    const bounds = buttonBoundsRef.current;
    if (!bounds) return;

    const dist = Math.hypot(e.clientX - bounds.cx, e.clientY - bounds.cy);
    if (dist > bounds.maxRadius) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
      abortHold('Hold cancelled — keep finger on the SOS button for 1.5s.');
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    if (isHoldingRef.current) {
      abortHold('Hold for 1.5 seconds to activate SOS — brief tap cancelled.');
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    if (isHoldingRef.current) {
      abortHold('Touch interrupted — hold for 1.5 seconds to activate SOS.');
    }
  };

  // Accessible keyboard press-and-hold (Space or Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (e.repeat || isHoldingRef.current) return;
    const started = beginHoldSession();
    if (started) {
      activeKeyRef.current = e.key;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (activeKeyRef.current !== e.key) return;
    e.preventDefault();
    if (isHoldingRef.current) {
      abortHold('Hold Space or Enter for 1.5 seconds to activate SOS.');
    }
  };

  // Cancel active hold cleanly if window loses focus, tab hides, or pointer cancels globally
  useEffect(() => {
    const onGlobalCancel = () => {
      if (isHoldingRef.current) {
        abortHold();
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden && isHoldingRef.current) {
        abortHold();
      }
    };

    window.addEventListener('blur', onGlobalCancel);
    window.addEventListener('pointercancel', onGlobalCancel);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('blur', onGlobalCancel);
      window.removeEventListener('pointercancel', onGlobalCancel);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [abortHold]);

  // Escape key closes countdown confirmation safely
  useEffect(() => {
    if (sosState !== 'COUNTDOWN') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelSosCountdown();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelSosCountdown, sosState]);

  // Cleanup RAF, timers, and transient SOS state/audio on unmount (navigation away)
  useEffect(() => {
    return () => {
      stopHoldLoop();
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
      cleanupTransientSosState();
    };
  }, [cleanupTransientSosState, stopHoldLoop]);

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

  const isButtonBusyOrActive =
    sosState === 'COUNTDOWN' ||
    sosState === 'CONFIRMED' ||
    sosState === 'SENDING' ||
    sosState === 'SENT' ||
    isTestMode;

  const isSoundEnabled = safetySettings.emergencyNotificationSound;
  const remainingHoldSeconds = Math.max(
    0,
    ((HOLD_DURATION_MS * (100 - holdProgress)) / 100 / 1000)
  ).toFixed(1);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#020617] text-[#11241C] dark:text-[#F8FAFC] flex flex-col pb-24 transition-colors">
      {/* Top Header */}
      <header className="w-full sticky top-0 z-30 bg-white/95 dark:bg-[#15211B]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] text-[#11241C] dark:text-[#F8FAFC] transition-colors cursor-pointer"
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
            type="button"
            onClick={call112}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B42318] hover:bg-[#912018] text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>CALL 112</span>
          </button>
        </div>
      </header>

      {/* Official Government Emergency Services Disclaimer */}
      <div className="w-full bg-[#FFF4E5] dark:bg-amber-950/40 border-b border-[#FFE0B2] dark:border-amber-900/40">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-start gap-2 text-xs text-[#7A4100] dark:text-amber-200">
          <Info className="w-4 h-4 text-[#B76E00] dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="font-bold">Important Notice:</strong> MYJPG notifies selected trusted contacts and opted-in community responders. It <strong className="underline">does not replace official emergency services</strong>. For immediate danger, always call 112 directly.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="w-full bg-white dark:bg-[#15211B] border-b border-[#E8E4DA] dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('sos')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'sos'
                ? 'bg-[#007AFF] text-white dark:bg-blue-600'
                : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
            }`}
          >
            🆘 SOS Control
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-[#007AFF] text-white dark:bg-blue-600'
                : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Trusted Contacts ({trustedContacts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#007AFF] text-white dark:bg-blue-600'
                : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          {safetySettings.nearbyAlertsEnabled && (
            <button
              type="button"
              onClick={() => setActiveTab('nearby')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'nearby'
                  ? 'bg-[#007AFF] text-white dark:bg-blue-600'
                  : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Community ({nearbyAlerts.length})</span>
            </button>
          )}
        </div>
      </div>

      <main className="w-full max-w-4xl mx-auto p-4 space-y-4 flex-1">
        {/* ========================================================= */}
        {/* SENT / ACTIVE SOS STATUS BANNER (Verified Backend Receipt) */}
        {/* ========================================================= */}
        {sosState === 'SENT' && activeEvent && (
          <div className="bg-[#FEF3F2] dark:bg-red-950/40 border-2 border-[#FECDCA] dark:border-red-900/60 rounded-3xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D92D20] animate-ping" />
                <span className="text-xs font-black tracking-wider uppercase text-[#B42318] dark:text-red-300">
                  EMERGENCY SOS CONFIRMED & ACTIVE
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#7A271A] dark:text-red-200 bg-[#FEE4E2] dark:bg-red-900/60 px-2 py-0.5 rounded-md">
                Ref: {activeEvent.id}
              </span>
            </div>

            <div className="bg-white/95 dark:bg-[#0F172A] rounded-2xl p-3.5 space-y-2 border border-[#FECDCA] dark:border-red-900/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                  Broadcast Location:
                </span>
                <span className="font-extrabold text-[#11241C] dark:text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D92D20]" />
                  {activeEvent.city || 'Jalpaiguri'}, {activeEvent.state || 'West Bengal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                  Trusted Contacts:
                </span>
                <span className="font-bold text-[#007AFF] dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeEvent.delivery_mode === 'development_recorded'
                    ? `Recorded in Dev Safe Mode (${trustedContacts.length} contacts)`
                    : `Dispatched (${trustedContacts.length} contacts)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                  Nearby Community:
                </span>
                <span className="font-bold text-[#55685F] dark:text-[#A2B3AA]">
                  {activeEvent.alerts_sent_nearby
                    ? '✓ Anonymous alert active'
                    : 'Disabled (Opt-in only)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                  Recorded At:
                </span>
                <span className="font-mono text-[11px] font-bold text-[#11241C] dark:text-white">
                  {new Date(activeEvent.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={call112}
                className="py-3 px-3 rounded-2xl bg-[#D92D20] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call 112 Police</span>
              </button>

              <button
                type="button"
                onClick={shareEmergencyLocation}
                className="py-3 px-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/15 text-[#11241C] dark:text-white font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FAF8F5] dark:hover:bg-[#1E293B] active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#007AFF]" />
                <span>Share Location</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#FECDCA] dark:border-red-900/50 text-[#B42318] dark:text-red-300 font-bold text-xs hover:bg-[#FEE4E2] dark:hover:bg-red-950/60 transition-colors cursor-pointer"
            >
              Cancel SOS (I am safe now)
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* FAILED DELIVERY BANNER (Honest Error Reporting + Retry) */}
        {/* ========================================================= */}
        {sosState === 'FAILED' && (
          <div
            role="alert"
            className="bg-[#FEF3F2] dark:bg-red-950/50 border-2 border-[#D92D20] rounded-3xl p-5 shadow-md space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#D92D20] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-[#B42318] dark:text-red-300">
                    SOS Alert Delivery Failed
                  </h3>
                  <p className="text-xs text-[#7A271A] dark:text-red-200 mt-1 leading-relaxed">
                    {sosError ||
                      'Could not reach the emergency server. Your SOS alert was NOT sent.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissSosFeedback}
                className="p-1 rounded-full text-[#7A271A] dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={retrySendSos}
                className="py-2.5 px-3 rounded-2xl bg-[#D92D20] hover:bg-[#B91C1C] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Sending SOS</span>
              </button>
              <button
                type="button"
                onClick={call112}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#FECDCA] dark:border-red-900/50 text-[#B42318] dark:text-red-300 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call 112 Directly</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CANCELLED CONFIRMATION BANNER */}
        {/* ========================================================= */}
        {sosState === 'CANCELLED' && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-3xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-extrabold text-[#11241C] dark:text-white">
                  Emergency Countdown Cancelled
                </p>
                <p className="text-[#55685F] dark:text-[#A2B3AA]">
                  No SOS alert or notification was sent.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissSosFeedback}
              className="p-1.5 rounded-full text-[#55685F] dark:text-[#A2B3AA] hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
              aria-label="Dismiss cancellation notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TEST SIMULATION MODE BANNER */}
        {/* ========================================================= */}
        {isTestMode && (
          <div className="bg-[#FEFBE8] dark:bg-amber-950/40 border-2 border-[#FDE047] dark:border-amber-700/60 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-wider uppercase text-[#854D0E] dark:text-amber-300 flex items-center gap-1.5">
                <span>🧪</span> TEST SIMULATION MODE ACTIVE
              </span>
              <button
                type="button"
                onClick={exitTestMode}
                className="text-xs font-bold text-[#854D0E] bg-[#FEF08A] px-2.5 py-1 rounded-full hover:bg-[#FDE047] cursor-pointer"
              >
                Exit Test
              </button>
            </div>
            <p className="text-xs text-[#713F12] dark:text-amber-200 leading-relaxed">
              This is a safety test simulation. Device coordinates were verified. <strong className="font-bold">No real emergency services or community members were contacted.</strong>
            </p>
            <div className="bg-white/85 dark:bg-[#0F172A] rounded-2xl p-3 text-xs space-y-1">
              <p className="text-[#55685F] dark:text-[#A2B3AA]">
                Detected GPS:{' '}
                {typeof location?.lat === 'number' ? location.lat.toFixed(4) : '26.5414'}°,{' '}
                {typeof location?.lng === 'number' ? location.lng.toFixed(4) : '88.7196'}°
              </p>
              <p className="text-[#55685F] dark:text-[#A2B3AA]">
                Accuracy: ±{location?.accuracy || 20}m
              </p>
              <p className="text-[#007AFF] dark:text-blue-400 font-bold">
                ✓ Simulation successfully verified (Zero real alerts sent)
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: SOS CONTROL HUB */}
        {/* ========================================================= */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            {/* Primary HOLD FOR SOS Button Container */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs text-center flex flex-col items-center gap-5 transition-colors">
              <div className="w-full relative flex flex-wrap items-center justify-center gap-2 min-h-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3F2] dark:bg-red-950/50 text-[#B42318] dark:text-red-400 border border-[#FECDCA] dark:border-red-900/50">
                  Primary Emergency Action
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateSafetySettings({
                      emergencyNotificationSound: !isSoundEnabled
                    })
                  }
                  className={`sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    isSoundEnabled
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-[#FAF8F5] dark:bg-[#131F1A] text-[#55685F] dark:text-[#A2B3AA] border-[#E8E4DA] dark:border-white/10'
                  }`}
                  aria-pressed={isSoundEnabled}
                  aria-label={
                    isSoundEnabled ? 'Mute confirmation sound' : 'Enable confirmation sound'
                  }
                >
                  {isSoundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-lg font-extrabold text-[#11241C] dark:text-white">
                  Hold Button for 1.5 Seconds
                </h2>
                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
                  Press and hold the red SOS button continuously for 1.5 seconds. Releasing early cancels safely.
                </p>
              </div>

              {/* Big Circular Hold-to-SOS Button with Concentric Non-Blocking Radial Progress */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center select-none touch-none">
                {/* Progress SVG Ring (pointer-events-none so it NEVER intercepts touches/clicks) */}
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-0"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#FEE4E2"
                    strokeWidth="5"
                    className="dark:stroke-gray-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#D92D20"
                    strokeWidth="5"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - holdProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Main Interactive Button */}
                <button
                  ref={buttonRef}
                  type="button"
                  disabled={isButtonBusyOrActive}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    touchAction: 'none'
                  }}
                  className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-transform select-none touch-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007AFF] ${
                    isButtonBusyOrActive
                      ? 'bg-[#D92D20]/60 cursor-not-allowed opacity-75'
                      : holdProgress > 0
                        ? 'scale-95 bg-[#991B1B] cursor-pointer'
                        : 'bg-[#D92D20] hover:bg-[#B91C1C] active:scale-95 cursor-pointer'
                  }`}
                  aria-label="Hold for 1.5 seconds to trigger SOS"
                >
                  {sosState === 'SENDING' || sosState === 'CONFIRMED' ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-1 animate-spin" />
                      <span className="text-sm font-black tracking-wider uppercase">
                        SENDING...
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-9 h-9 mb-1 pointer-events-none" />
                      <span className="text-sm font-black tracking-wider uppercase pointer-events-none">
                        {holdProgress > 0 ? `${Math.round(holdProgress)}%` : 'HOLD FOR SOS'}
                      </span>
                      <span className="text-[10px] font-semibold text-white/85 mt-0.5 pointer-events-none">
                        {holdProgress > 0
                          ? `Keep holding (${remainingHoldSeconds}s)`
                          : '1.5s Press & Hold'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Steady-height Hold / Tap Status Feedback */}
              <div className="min-h-9 w-full max-w-md mx-auto flex items-center justify-center">
                {holdHint ? (
                  <p className="text-xs font-bold text-[#B42318] dark:text-red-300 bg-[#FEF3F2] dark:bg-red-950/50 border border-[#FECDCA] dark:border-red-900/50 px-3 py-1.5 rounded-full">
                    {holdHint}
                  </p>
                ) : (
                  <p className="text-[11px] font-semibold text-[#667085] dark:text-[#889B91] leading-relaxed">
                    {sosState === 'SENT'
                      ? 'SOS is currently active above.'
                      : 'Single taps will not trigger an alert. Requires continuous 1.5s hold + confirmation.'}
                  </p>
                )}
              </div>
            </div>

            {/* Shake Phone Section */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white flex items-center gap-1.5">
                      <span>Shake Phone 3 Times</span>
                      {safetySettings.shakeToSosEnabled && shakeSupported && (
                        <span
                          className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                          title="Active Sensor"
                        />
                      )}
                    </h3>
                    <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                      Motion gesture emergency trigger
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateSafetySettings({
                      shakeToSosEnabled: !safetySettings.shakeToSosEnabled
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    safetySettings.shakeToSosEnabled
                      ? 'bg-[#007AFF] dark:bg-blue-600'
                      : 'bg-[#D2CEBE] dark:bg-gray-700'
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
                  <div className="flex items-center justify-between text-xs font-bold text-[#11241C] dark:text-[#F8FAFC]">
                    <span className="text-[#55685F] dark:text-[#A2B3AA]">
                      Shake Progress Tracker:
                    </span>
                    <span
                      className={
                        shakeCurrentCount > 0
                          ? 'text-red-500 font-extrabold'
                          : 'text-[#55685F] dark:text-[#A2B3AA]'
                      }
                    >
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
                              : 'bg-white dark:bg-[#0F172A] text-[#55685F] dark:text-gray-400 border-[#E8E4DA] dark:border-white/10'
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
                        type="button"
                        onClick={requestShakePermission}
                        className="text-xs font-bold text-[#007AFF] dark:text-blue-400 underline cursor-pointer"
                      >
                        Grant motion sensor permission
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => simulateShake()}
                      className="ml-auto px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C2C24] border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#007AFF] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-[#233A2F] active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      title="Test motion detection countdown without moving phone"
                    >
                      <span>Simulate Shake</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
                {shakeSupported ? (
                  <>
                    When enabled, vigorously shaking your phone 3 times triggers the emergency SOS confirmation countdown.
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
                type="button"
                onClick={call112}
                className="p-3.5 rounded-3xl bg-[#B42318] hover:bg-[#912018] text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call 112 (All Emergency)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = 'tel:1091';
                }}
                className="p-3.5 rounded-3xl bg-[#FAF8F5] dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#D92D20]" />
                <span>Call 1091 (Women Helpline)</span>
              </button>
            </div>

            {/* Dedicated Sexual Violence & Assault Support Link Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => onNavigate('sexual-violence-support')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate('sexual-violence-support');
                }
              }}
              className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 hover:border-[#007AFF] dark:hover:border-blue-500 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-98"
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
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA] uppercase tracking-wider">
                  Developer & User Verification
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FEF9C3] dark:bg-amber-950/60 text-[#854D0E] dark:text-amber-300 font-bold text-[10px]">
                  Simulation Only
                </span>
              </div>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Test your phone's GPS detection cleanly without notifying real people, contacting emergency services, or triggering alarm loops.
              </p>
              <button
                type="button"
                onClick={runTestSafetyAlert}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
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
                  Notified automatically with your approximate location if SOS is confirmed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-blue-700 cursor-pointer"
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
                  className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#E5E1D5] dark:border-white/10 text-[#007AFF] dark:text-[#38BDF8] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                          {c.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#007AFF] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                          {c.relationship}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                        {c.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTrustedContact(c.id)}
                    className="p-2 text-[#8C9B93] hover:text-[#D92D20] transition-colors cursor-pointer"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {trustedContacts.length === 0 && (
                <div className="bg-white dark:bg-[#0F172A] border border-dashed border-[#D2CEBE] dark:border-white/15 rounded-3xl p-6 text-center space-y-2">
                  <Users className="w-8 h-8 text-[#8C9B93] mx-auto" />
                  <p className="text-sm font-bold text-[#11241C] dark:text-white">
                    No Trusted Contacts Added
                  </p>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                    Add at least one family member or close friend to receive immediate notifications.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Add First Contact
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={sendSmsToTrustedContacts}
              className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
              <span>Test SMS to First Contact</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SAFETY SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4 divide-y divide-[#E8E4DA] dark:divide-white/10 transition-colors">
              {/* Setting 1: Instant SOS */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    Instant SOS (Skip Countdown)
                  </h4>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    {safetySettings.instantSosEnabled
                      ? 'SOS broadcasts immediately after completing the 1.5s hold without the 5s false-alarm countdown.'
                      : 'Recommended: 5-second countdown provides protection against accidental triggers.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSafetySettings({
                      instantSosEnabled: !safetySettings.instantSosEnabled
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                    safetySettings.instantSosEnabled
                      ? 'bg-[#D92D20]'
                      : 'bg-[#D2CEBE] dark:bg-gray-700'
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
                  type="button"
                  onClick={() =>
                    updateSafetySettings({
                      shakeToSosEnabled: !safetySettings.shakeToSosEnabled
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                    safetySettings.shakeToSosEnabled
                      ? 'bg-[#007AFF] dark:bg-blue-600'
                      : 'bg-[#D2CEBE] dark:bg-gray-700'
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

              {/* Setting 3: Confirmation Chime */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    Emergency Confirmation Chime
                  </h4>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    Plays a single brief tone only when SOS is confirmed and sent (never on tap or cancel).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSafetySettings({
                      emergencyNotificationSound: !safetySettings.emergencyNotificationSound
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                    safetySettings.emergencyNotificationSound
                      ? 'bg-[#007AFF] dark:bg-blue-600'
                      : 'bg-[#D2CEBE] dark:bg-gray-700'
                  }`}
                  aria-label="Toggle Confirmation Chime"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      safetySettings.emergencyNotificationSound
                        ? 'translate-x-6'
                        : 'translate-x-1'
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
                      <span className="text-[10px] font-black uppercase text-[#007AFF] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                        Opt-In
                      </span>
                    </h4>
                    <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                      Receive and dispatch anonymous emergency alerts with nearby community members.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSafetySettings({
                        nearbyAlertsEnabled: !safetySettings.nearbyAlertsEnabled
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-3 ${
                      safetySettings.nearbyAlertsEnabled
                        ? 'bg-[#007AFF] dark:bg-blue-600'
                        : 'bg-[#D2CEBE] dark:bg-gray-700'
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
                      <span className="text-[#55685F] dark:text-[#A2B3AA]">
                        Proximity Alert Radius:
                      </span>
                      <span className="text-[#007AFF] dark:text-[#38BDF8]">
                        {safetySettings.nearbyAlertRadiusKm} km
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([0.5, 1, 2, 5] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => updateSafetySettings({ nearbyAlertRadiusKm: r })}
                          className={`py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            safetySettings.nearbyAlertRadiusKm === r
                              ? 'bg-[#007AFF] dark:bg-blue-600 text-white'
                              : 'bg-white dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
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
              <span className="text-[11px] text-[#007AFF] dark:text-[#38BDF8] font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                Within {safetySettings.nearbyAlertRadiusKm}km
              </span>
            </div>

            <div className="space-y-2.5">
              {nearbyAlerts.map((alert) => (
                <div
                  key={alert.eventId}
                  className="bg-white dark:bg-[#0F172A] border border-[#FECDCA] dark:border-red-900/50 rounded-3xl p-4 shadow-xs space-y-2 transition-colors"
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
                      type="button"
                      onClick={call112}
                      className="px-2.5 py-1 bg-[#D92D20] text-white font-bold text-[11px] rounded-lg cursor-pointer"
                    >
                      Call 112
                    </button>
                  </div>
                </div>
              ))}

              {nearbyAlerts.length === 0 && (
                <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-6 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-[#007AFF] dark:text-blue-400 mx-auto" />
                  <p className="text-sm font-bold text-[#11241C] dark:text-white">
                    No Active Emergency Alerts
                  </p>
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
      {/* FALSE-ALARM PROTECTION COUNTDOWN / SENDING MODAL */}
      {/* ========================================================= */}
      {(sosState === 'COUNTDOWN' || sosState === 'CONFIRMED' || sosState === 'SENDING') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-countdown-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 w-full max-w-sm text-center space-y-6 shadow-2xl border-2 border-[#D92D20] animate-in fade-in zoom-in-95 transition-colors">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#D92D20] dark:text-red-400">
                {triggerSource === 'SHAKE' ? 'Motion Gesture Detected' : 'SOS Hold Completed'}
              </span>
              <h2
                id="sos-countdown-title"
                className="text-2xl font-black text-[#11241C] dark:text-white"
              >
                {sosState === 'SENDING' || sosState === 'CONFIRMED'
                  ? 'Sending SOS Alert...'
                  : 'Confirm Emergency SOS?'}
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                {sosState === 'SENDING' || sosState === 'CONFIRMED'
                  ? 'Contacting MYJPG emergency service and recording your verified alert.'
                  : 'Alert will submit automatically when countdown finishes unless you cancel:'}
              </p>
            </div>

            {/* Countdown or Sending Indicator */}
            <div className="w-28 h-28 rounded-full bg-[#FEF3F2] dark:bg-red-950/40 border-4 border-[#D92D20] mx-auto flex items-center justify-center shadow-inner">
              {sosState === 'SENDING' || sosState === 'CONFIRMED' ? (
                <Loader2 className="w-12 h-12 text-[#D92D20] dark:text-red-400 animate-spin" />
              ) : (
                <span className="text-5xl font-black text-[#D92D20] dark:text-red-400 font-mono">
                  {countdown}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                disabled={sosState === 'SENDING' || sosState === 'CONFIRMED'}
                onClick={confirmSos}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#D92D20] hover:bg-[#B91C1C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {sosState === 'SENDING' || sosState === 'CONFIRMED' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending SOS Alert...</span>
                  </>
                ) : (
                  <span>Confirm &amp; Send SOS Now</span>
                )}
              </button>

              {sosState === 'COUNTDOWN' && (
                <button
                  type="button"
                  onClick={cancelSosCountdown}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-extrabold text-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
                >
                  Cancel (False Alarm)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD TRUSTED CONTACT MODAL */}
      {/* ========================================================= */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-[#E8E4DA] dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">
                Add Trusted Contact
              </h3>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(false)}
                className="p-1 rounded-full text-[#8C9B93] hover:text-[#11241C] dark:hover:text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#11241C] dark:text-[#F8FAFC] block mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mother, Father, Friend"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D2CEBE] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#131F1A] font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#007AFF] dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#11241C] dark:text-[#F8FAFC] block mb-1">
                  Mobile Number (SMS Enabled)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98320 00000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D2CEBE] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#131F1A] font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#007AFF] dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#11241C] dark:text-[#F8FAFC] block mb-1">
                  Relationship
                </label>
                <select
                  value={newContactRelationship}
                  onChange={(e) =>
                    setNewContactRelationship(e.target.value as TrustedContact['relationship'])
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#D2CEBE] dark:border-white/15 bg-[#FAF8F5] dark:bg-[#131F1A] font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#007AFF] dark:focus:border-blue-500"
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
                  className="w-1/2 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-2xl bg-[#007AFF] dark:bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
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
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-[#E8E4DA] dark:border-white/10 transition-colors">
            <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">
              Cancel Emergency SOS
            </h3>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
              Confirm that you are safe. This updates the backend log and resolves your active SOS.
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
                      ? 'border-[#007AFF] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60'
                      : 'border-[#E8E4DA] dark:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancellationReason === reason}
                    onChange={() => setCancellationReason(reason)}
                    className="accent-[#007AFF]"
                  />
                  <span className="font-bold text-[#11241C] dark:text-white">{reason}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="w-1/2 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA] text-xs cursor-pointer"
              >
                Keep SOS Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelSos}
                className="w-1/2 py-2.5 rounded-2xl bg-[#D92D20] text-white font-bold text-xs hover:bg-[#B91C1C] cursor-pointer"
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
