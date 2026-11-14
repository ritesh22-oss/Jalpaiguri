import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EmergencyEvent,
  TrustedContact,
  SafetySettings,
  PrivateIncidentNote
} from '../types';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';
import { sosAudioController } from '../utils/sosAudio';

export interface AnonymousSafetyAlert {
  eventId: string;
  eventType: string;
  approximateArea: string;
  timeAgo: string;
  created_at: string;
  anonymousNotice: string;
  urgentActionNotice: string;
}

export type ShakePermissionStatus = 'unsupported' | 'prompt' | 'granted' | 'denied';

export type SosState =
  | 'IDLE'
  | 'PRESSING'
  | 'COUNTDOWN'
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED';

interface SafetyContextType {
  sosState: SosState;
  sosError: string | null;
  isTestMode: boolean;
  countdown: number;
  triggerSource: 'BUTTON' | 'SHAKE' | 'TEST' | null;
  activeEvent: EmergencyEvent | null;
  trustedContacts: TrustedContact[];
  safetySettings: SafetySettings;
  shakeSupported: boolean;
  shakePermissionGranted: boolean;
  shakePermissionStatus: ShakePermissionStatus;
  shakeCurrentCount: number;
  privateNotes: PrivateIncidentNote[];
  nearbyAlerts: AnonymousSafetyAlert[];
  startPressHold: () => boolean;
  cancelPressHold: () => void;
  completeHoldActivation: () => void;
  confirmSos: () => Promise<void>;
  retrySendSos: () => Promise<void>;
  cancelSosCountdown: () => void;
  dismissSosFeedback: () => void;
  cleanupTransientSosState: () => void;
  cancelActiveSos: (reason?: string) => Promise<void>;
  call112: () => void;
  shareEmergencyLocation: () => Promise<void>;
  sendSmsToTrustedContacts: () => void;
  runTestSafetyAlert: () => void;
  exitTestMode: () => void;
  requestShakePermission: () => Promise<boolean>;
  simulateShake: (count?: number) => void;
  updateSafetySettings: (settings: Partial<SafetySettings>) => void;
  addTrustedContact: (contact: Omit<TrustedContact, 'id' | 'addedAt'>) => void;
  removeTrustedContact: (id: string) => void;
  updateTrustedContact: (id: string, updates: Partial<TrustedContact>) => void;
  addPrivateNote: (
    note: Omit<PrivateIncidentNote, 'id' | 'referenceNumber' | 'createdAt' | 'isEncryptedLocally'>
  ) => PrivateIncidentNote;
  deletePrivateNote: (id: string) => void;
  fetchNearbySafetyAlerts: () => Promise<void>;
}

const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  shakeToSosEnabled: true,
  instantSosEnabled: false,
  nearbyAlertsEnabled: false,
  nearbyAlertRadiusKm: 2,
  locationSharingEnabled: true,
  emergencyNotificationSound: true,
  hasSeenSafetyDisclaimer: false
};

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

function getLocalUserId(userId?: string | null): string {
  if (userId) return userId;
  try {
    const existing = localStorage.getItem('jpg_device_user_id');
    if (existing) return existing;
    const created = `usr-${Date.now().toString(36)}`;
    localStorage.setItem('jpg_device_user_id', created);
    return created;
  } catch {
    return 'guest-user';
  }
}

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { location } = useLocation();
  const { user } = useAuth();

  const [sosState, setSosState] = useState<SosState>('IDLE');
  const [sosError, setSosError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [triggerSource, setTriggerSource] = useState<'BUTTON' | 'SHAKE' | 'TEST' | null>(null);
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | null>(null);

  const [safetySettings, setSafetySettings] = useState<SafetySettings>(() => {
    try {
      const saved = localStorage.getItem('jpg_safety_settings');
      if (saved) return { ...DEFAULT_SAFETY_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_SAFETY_SETTINGS;
  });

  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(() => {
    try {
      const saved = localStorage.getItem('jpg_trusted_contacts');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    return [
      {
        id: 'tc-default-1',
        name: 'Primary Family Contact',
        phone: '+91 98320 00001',
        relationship: 'Parent',
        isEmergencyAlertContact: true,
        addedAt: new Date().toISOString()
      }
    ];
  });

  const [privateNotes, setPrivateNotes] = useState<PrivateIncidentNote[]>(() => {
    try {
      const saved = localStorage.getItem('jpg_private_incident_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  const [nearbyAlerts, setNearbyAlerts] = useState<AnonymousSafetyAlert[]>([]);

  const [shakeSupported, setShakeSupported] = useState<boolean>(true);
  const [shakePermissionGranted, setShakePermissionGranted] = useState<boolean>(false);
  const [shakePermissionStatus, setShakePermissionStatus] = useState<ShakePermissionStatus>('prompt');
  const [shakeCurrentCount, setShakeCurrentCount] = useState<number>(0);

  // Authoritative refs to eliminate stale closures and enforce strict state transitions
  const sosStateRef = useRef<SosState>('IDLE');
  const isTestModeRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const pendingRequestIdRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const cancelledResetTimerRef = useRef<number | null>(null);
  const soundEnabledRef = useRef<boolean>(safetySettings.emergencyNotificationSound);

  const lastShakeTimeRef = useRef<number>(0);
  const shakeCountRef = useRef<number>(0);
  const lastAccRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const shakeResetTimerRef = useRef<number | null>(null);

  const setSosStateSync = useCallback((next: SosState) => {
    sosStateRef.current = next;
    setSosState(next);
  }, []);

  useEffect(() => {
    soundEnabledRef.current = safetySettings.emergencyNotificationSound;
    if (!safetySettings.emergencyNotificationSound) {
      sosAudioController.stopAll();
    }
  }, [safetySettings.emergencyNotificationSound]);

  useEffect(() => {
    try {
      localStorage.setItem('jpg_safety_settings', JSON.stringify(safetySettings));
    } catch {
      // Ignore storage errors
    }
  }, [safetySettings]);

  useEffect(() => {
    try {
      localStorage.setItem('jpg_trusted_contacts', JSON.stringify(trustedContacts));
    } catch {
      // Ignore storage errors
    }
  }, [trustedContacts]);

  useEffect(() => {
    try {
      localStorage.setItem('jpg_private_incident_notes', JSON.stringify(privateNotes));
    } catch {
      // Ignore storage errors
    }
  }, [privateNotes]);

  const clearCountdownTimer = useCallback(() => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const clearCancelledResetTimer = useCallback(() => {
    if (cancelledResetTimerRef.current !== null) {
      window.clearTimeout(cancelledResetTimerRef.current);
      cancelledResetTimerRef.current = null;
    }
  }, []);

  // Global cleanup on unmount
  useEffect(() => {
    return () => {
      clearCountdownTimer();
      clearCancelledResetTimer();
      if (shakeResetTimerRef.current !== null) {
        window.clearTimeout(shakeResetTimerRef.current);
        shakeResetTimerRef.current = null;
      }
      sosAudioController.stopAll();
    };
  }, [clearCountdownTimer, clearCancelledResetTimer]);

  // Restore active SOS event from backend on mount ONLY if backend explicitly confirms one
  useEffect(() => {
    const userId = getLocalUserId(user?.id);
    let active = true;

    fetch(`/api/emergency/active?userId=${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        if (data?.success && data.active && data.event && sosStateRef.current === 'IDLE') {
          setActiveEvent(data.event);
          setSosStateSync('SENT');
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user?.id, setSosStateSync]);

  // Submit confirmed SOS to backend (never fabricates SENT on failure)
  const dispatchSosToBackend = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    clearCountdownTimer();

    if (!pendingRequestIdRef.current) {
      pendingRequestIdRef.current = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    const clientRequestId = pendingRequestIdRef.current;

    setSosError(null);
    setSosStateSync('CONFIRMED');
    setSosStateSync('SENDING');

    const userId = getLocalUserId(user?.id);
    const userName = user?.name || 'Citizen';
    const lat = typeof location?.lat === 'number' ? location.lat : 26.5414;
    const lng = typeof location?.lng === 'number' ? location.lng : 88.7196;
    const accuracy = typeof location?.accuracy === 'number' ? location.accuracy : 20;
    const city = location?.city || location?.locality || 'Jalpaiguri';
    const state = location?.state || 'West Bengal';

    try {
      const res = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          eventType: 'SAFETY_SOS',
          latitude: lat,
          longitude: lng,
          accuracy,
          city,
          district: location?.district || '',
          state,
          trustedContacts: trustedContacts.filter((c) => c.isEmergencyAlertContact),
          isNearbyOptIn: safetySettings.nearbyAlertsEnabled,
          clientRequestId
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success || !data?.event) {
        const errMsg =
          data?.error ||
          (res.status === 429
            ? 'Too many emergency requests in a short window. Please wait a few seconds or call 112 directly.'
            : `Emergency server returned status ${res.status}. Alert was NOT delivered.`);
        setSosError(errMsg);
        setSosStateSync('FAILED');
        sosAudioController.stopAll();
        return;
      }

      pendingRequestIdRef.current = null;
      setActiveEvent(data.event);
      setSosError(null);
      setSosStateSync('SENT');

      // Play ONE clean confirmation chime ONLY upon verified backend confirmation
      sosAudioController.playConfirmationTone(soundEnabledRef.current);
    } catch {
      setSosError(
        'Network error: could not reach the emergency server. Your SOS alert was NOT sent. Tap Retry or call 112 immediately.'
      );
      setSosStateSync('FAILED');
      sosAudioController.stopAll();
    } finally {
      isSubmittingRef.current = false;
    }
  }, [
    clearCountdownTimer,
    location,
    safetySettings.nearbyAlertsEnabled,
    setSosStateSync,
    trustedContacts,
    user
  ]);

  const startCountdownOrInstant = useCallback(
    (source: 'BUTTON' | 'SHAKE') => {
      clearCountdownTimer();
      clearCancelledResetTimer();
      sosAudioController.stopAll();
      setSosError(null);
      setTriggerSource(source);
      pendingRequestIdRef.current = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      if (safetySettings.instantSosEnabled) {
        void dispatchSosToBackend();
        return;
      }

      setCountdown(5);
      setSosStateSync('COUNTDOWN');

      let remaining = 5;
      countdownIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearCountdownTimer();
          setCountdown(0);
          void dispatchSosToBackend();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    },
    [
      clearCancelledResetTimer,
      clearCountdownTimer,
      dispatchSosToBackend,
      safetySettings.instantSosEnabled,
      setSosStateSync
    ]
  );

  // State machine actions for Press-and-Hold button
  const startPressHold = useCallback((): boolean => {
    const current = sosStateRef.current;
    if (
      current !== 'IDLE' &&
      current !== 'CANCELLED' &&
      current !== 'FAILED'
    ) {
      return false;
    }
    if (isTestModeRef.current || isSubmittingRef.current) return false;

    clearCancelledResetTimer();
    sosAudioController.stopAll();
    setSosError(null);
    setSosStateSync('PRESSING');
    return true;
  }, [clearCancelledResetTimer, setSosStateSync]);

  const cancelPressHold = useCallback(() => {
    sosAudioController.stopAll();
    if (sosStateRef.current === 'PRESSING') {
      setSosStateSync('IDLE');
    }
  }, [setSosStateSync]);

  const completeHoldActivation = useCallback(() => {
    if (sosStateRef.current !== 'PRESSING') return;
    startCountdownOrInstant('BUTTON');
  }, [startCountdownOrInstant]);

  const confirmSos = useCallback(async () => {
    if (sosStateRef.current !== 'COUNTDOWN') return;
    await dispatchSosToBackend();
  }, [dispatchSosToBackend]);

  const retrySendSos = useCallback(async () => {
    if (sosStateRef.current !== 'FAILED') return;
    await dispatchSosToBackend();
  }, [dispatchSosToBackend]);

  const cancelSosCountdown = useCallback(() => {
    clearCountdownTimer();
    clearCancelledResetTimer();
    sosAudioController.stopAll();
    pendingRequestIdRef.current = null;
    setTriggerSource(null);
    setCountdown(5);
    setSosError(null);

    if (sosStateRef.current === 'COUNTDOWN' || sosStateRef.current === 'PRESSING') {
      setSosStateSync('CANCELLED');
      cancelledResetTimerRef.current = window.setTimeout(() => {
        if (sosStateRef.current === 'CANCELLED') {
          setSosStateSync('IDLE');
        }
      }, 3000);
    }
  }, [clearCancelledResetTimer, clearCountdownTimer, setSosStateSync]);

  const dismissSosFeedback = useCallback(() => {
    clearCancelledResetTimer();
    sosAudioController.stopAll();
    if (sosStateRef.current === 'CANCELLED' || sosStateRef.current === 'FAILED') {
      pendingRequestIdRef.current = null;
      setSosError(null);
      setTriggerSource(null);
      setSosStateSync('IDLE');
    }
  }, [clearCancelledResetTimer, setSosStateSync]);

  const cleanupTransientSosState = useCallback(() => {
    clearCountdownTimer();
    clearCancelledResetTimer();
    sosAudioController.stopAll();

    const s = sosStateRef.current;
    if (s === 'PRESSING' || s === 'COUNTDOWN' || s === 'CANCELLED' || s === 'FAILED') {
      pendingRequestIdRef.current = null;
      setTriggerSource(null);
      setCountdown(5);
      setSosError(null);
      setSosStateSync('IDLE');
    }
  }, [clearCancelledResetTimer, clearCountdownTimer, setSosStateSync]);

  const cancelActiveSos = useCallback(
    async (reason: string = 'Resolved safely by user') => {
      const userId = getLocalUserId(user?.id);
      const eventId = activeEvent?.id;
      sosAudioController.stopAll();
      clearCountdownTimer();
      clearCancelledResetTimer();

      try {
        await fetch('/api/emergency/cancel-sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, userId, reason })
        });
      } catch {
        // Still allow clearing local UI active banner if backend call fails transiently
      }

      pendingRequestIdRef.current = null;
      setActiveEvent(null);
      setTriggerSource(null);
      setSosError(null);
      setCountdown(5);
      setSosStateSync('IDLE');
    },
    [activeEvent?.id, clearCancelledResetTimer, clearCountdownTimer, setSosStateSync, user?.id]
  );

  // Test Simulation Mode (strictly offline/local, never sends real alerts or triggers audio loop)
  const runTestSafetyAlert = useCallback(() => {
    if (sosStateRef.current === 'SENDING' || sosStateRef.current === 'SENT') return;
    clearCountdownTimer();
    clearCancelledResetTimer();
    sosAudioController.stopAll();

    const lat = location?.lat || 26.5414;
    const lng = location?.lng || 88.7196;
    const city = location?.city || 'Jalpaiguri';
    const state = location?.state || 'West Bengal';

    const testEvent: EmergencyEvent = {
      id: `TEST-SIM-${Date.now().toString(36).toUpperCase()}`,
      user_id: user?.id || 'simulated-user',
      userName: user?.name || 'Simulation Mode',
      event_type: 'TEST_SIMULATION',
      created_at: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      city,
      state,
      status: 'TEST_SIMULATION',
      isTestMode: true,
      device_status: 'Simulated Device Online',
      alerts_sent_trusted: false,
      alerts_sent_nearby: false
    };

    isTestModeRef.current = true;
    setIsTestMode(true);
    setActiveEvent(testEvent);
    setTriggerSource('TEST');
    setSosError(null);
    setSosStateSync('IDLE');
  }, [clearCancelledResetTimer, clearCountdownTimer, location, setSosStateSync, user]);

  const exitTestMode = useCallback(() => {
    isTestModeRef.current = false;
    setIsTestMode(false);
    setActiveEvent(null);
    setTriggerSource(null);
    setSosError(null);
    setSosStateSync('IDLE');
    sosAudioController.stopAll();
  }, [setSosStateSync]);

  const call112 = useCallback(() => {
    window.location.href = 'tel:112';
  }, []);

  const getEmergencyMessageText = useCallback(() => {
    const userName = user?.name || 'Citizen';
    const area = location
      ? `${location.locality || location.city || 'Area'}, ${location.state || ''}`
      : 'Jalpaiguri, West Bengal';
    const mapUrl = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '';
    const eventId = activeEvent?.id || 'SOS-ACTIVE';

    return `EMERGENCY ALERT: ${userName} has activated Safety SOS on MYJPG (Ref: ${eventId}). They may need immediate assistance.\nApproximate Location: ${area}\nMap link: ${mapUrl}\nTime: ${new Date().toLocaleTimeString()}`;
  }, [user?.name, location, activeEvent?.id]);

  const shareEmergencyLocation = useCallback(async () => {
    const text = getEmergencyMessageText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency SOS - MYJPG',
          text,
          url: location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : undefined
        });
        return;
      } catch {
        // Fallback below
      }
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard unavailable
    }
  }, [getEmergencyMessageText, location]);

  const sendSmsToTrustedContacts = useCallback(() => {
    if (trustedContacts.length === 0) return;
    const text = encodeURIComponent(getEmergencyMessageText());
    const firstContactPhone = trustedContacts[0].phone.replace(/[^0-9+]/g, '');
    window.location.href = `sms:${firstContactPhone}?body=${text}`;
  }, [trustedContacts, getEmergencyMessageText]);

  // Motion sensor capability check
  useEffect(() => {
    if (typeof window === 'undefined') {
      setShakeSupported(false);
      setShakePermissionStatus('unsupported');
      return;
    }

    const hasMotion = 'DeviceMotionEvent' in window || 'ondevicemotion' in window;
    if (!hasMotion) {
      setShakeSupported(false);
      setShakePermissionStatus('unsupported');
      return;
    }

    setShakeSupported(true);
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      setShakePermissionStatus('prompt');
      setShakePermissionGranted(false);
    } else {
      setShakePermissionStatus('granted');
      setShakePermissionGranted(true);
    }
  }, []);

  const registerShakeStroke = useCallback(() => {
    if (!safetySettings.shakeToSosEnabled) return;
    const s = sosStateRef.current;
    if (s !== 'IDLE' && s !== 'CANCELLED' && s !== 'FAILED') return;
    if (isTestModeRef.current || isSubmittingRef.current) return;

    const now = Date.now();
    if (now - lastShakeTimeRef.current <= 260) return;
    lastShakeTimeRef.current = now;

    shakeCountRef.current += 1;
    const newCount = shakeCountRef.current;
    setShakeCurrentCount(newCount);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(70);
      } catch {
        // Ignore
      }
    }

    if (shakeResetTimerRef.current !== null) {
      window.clearTimeout(shakeResetTimerRef.current);
    }
    shakeResetTimerRef.current = window.setTimeout(() => {
      shakeCountRef.current = 0;
      setShakeCurrentCount(0);
    }, 2500);

    if (newCount >= 3) {
      if (shakeResetTimerRef.current !== null) {
        window.clearTimeout(shakeResetTimerRef.current);
        shakeResetTimerRef.current = null;
      }
      shakeCountRef.current = 0;
      setShakeCurrentCount(0);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([150, 70, 150]);
        } catch {
          // Ignore
        }
      }

      startCountdownOrInstant('SHAKE');
    }
  }, [safetySettings.shakeToSosEnabled, startCountdownOrInstant]);

  const handleDeviceMotion = useCallback(
    (event: DeviceMotionEvent) => {
      if (!safetySettings.shakeToSosEnabled) return;
      const s = sosStateRef.current;
      if (s !== 'IDLE' && s !== 'CANCELLED' && s !== 'FAILED') return;
      if (isTestModeRef.current) return;

      const linearAcc = event.acceleration;
      const totalAcc = event.accelerationIncludingGravity;

      let isStrongShake = false;

      if (linearAcc && linearAcc.x !== null && linearAcc.y !== null && linearAcc.z !== null) {
        const mag = Math.hypot(linearAcc.x || 0, linearAcc.y || 0, linearAcc.z || 0);
        // Deliberate sharp shake threshold without gravity interference
        isStrongShake = mag > 16;
      } else if (totalAcc && totalAcc.x !== null && totalAcc.y !== null && totalAcc.z !== null) {
        const x = totalAcc.x || 0;
        const y = totalAcc.y || 0;
        const z = totalAcc.z || 0;
        const mag = Math.hypot(x, y, z);
        let delta = 0;
        if (lastAccRef.current) {
          delta = Math.hypot(x - lastAccRef.current.x, y - lastAccRef.current.y, z - lastAccRef.current.z);
        }
        lastAccRef.current = { x, y, z };
        // Require BOTH strong deviation from 1G (9.81 m/s^2) and sudden delta to filter out normal walking/handling
        isStrongShake = Math.abs(mag - 9.81) > 13.5 && delta > 16;
      } else {
        return;
      }

      if (isStrongShake) {
        registerShakeStroke();
      }
    },
    [registerShakeStroke, safetySettings.shakeToSosEnabled]
  );

  const requestShakePermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const reqPerm = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;

    if (typeof reqPerm === 'function') {
      try {
        const state = await reqPerm();
        if (state === 'granted') {
          setShakePermissionGranted(true);
          setShakePermissionStatus('granted');
          return true;
        }
        setShakePermissionGranted(false);
        setShakePermissionStatus('denied');
        return false;
      } catch {
        setShakePermissionGranted(false);
        setShakePermissionStatus('denied');
        return false;
      }
    }

    if ('ondevicemotion' in window || 'DeviceMotionEvent' in window) {
      setShakePermissionGranted(true);
      setShakePermissionStatus('granted');
      return true;
    }

    setShakeSupported(false);
    setShakePermissionStatus('unsupported');
    return false;
  }, []);

  const simulateShake = useCallback(
    (count?: number) => {
      if (!safetySettings.shakeToSosEnabled) return;
      const s = sosStateRef.current;
      if (s !== 'IDLE' && s !== 'CANCELLED' && s !== 'FAILED') return;
      if (isTestModeRef.current) return;

      if (count !== undefined) {
        shakeCountRef.current = count;
        setShakeCurrentCount(count);
        if (count >= 3) {
          shakeCountRef.current = 0;
          setShakeCurrentCount(0);
          startCountdownOrInstant('SHAKE');
        }
        return;
      }

      lastShakeTimeRef.current = 0; // Allow rapid manual clicks on "Simulate Shake"
      registerShakeStroke();
    },
    [registerShakeStroke, safetySettings.shakeToSosEnabled, startCountdownOrInstant]
  );

  useEffect(() => {
    if (!safetySettings.shakeToSosEnabled) {
      shakeCountRef.current = 0;
      setShakeCurrentCount(0);
      if (shakeResetTimerRef.current !== null) {
        window.clearTimeout(shakeResetTimerRef.current);
        shakeResetTimerRef.current = null;
      }
      return;
    }

    if (typeof window === 'undefined' || !('ondevicemotion' in window || 'DeviceMotionEvent' in window)) {
      return;
    }

    if (shakePermissionGranted) {
      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }
  }, [safetySettings.shakeToSosEnabled, shakePermissionGranted, handleDeviceMotion]);

  const fetchNearbySafetyAlerts = useCallback(async () => {
    if (!safetySettings.nearbyAlertsEnabled) return;

    try {
      const res = await fetch('/api/emergency/nearby-alerts');
      if (res.ok) {
        const data = await res.json();
        if (data?.alerts) {
          setNearbyAlerts(data.alerts);
        }
      }
    } catch {
      // Ignore transient network errors for background polling
    }
  }, [safetySettings.nearbyAlertsEnabled]);

  useEffect(() => {
    if (safetySettings.nearbyAlertsEnabled) {
      void fetchNearbySafetyAlerts();
      const timer = window.setInterval(() => void fetchNearbySafetyAlerts(), 15000);
      return () => window.clearInterval(timer);
    }
  }, [safetySettings.nearbyAlertsEnabled, fetchNearbySafetyAlerts]);

  const addTrustedContact = useCallback((contact: Omit<TrustedContact, 'id' | 'addedAt'>) => {
    const newContact: TrustedContact = {
      ...contact,
      id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      addedAt: new Date().toISOString()
    };
    setTrustedContacts((prev) => [...prev, newContact]);
  }, []);

  const removeTrustedContact = useCallback((id: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateTrustedContact = useCallback((id: string, updates: Partial<TrustedContact>) => {
    setTrustedContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const updateSafetySettings = useCallback((settings: Partial<SafetySettings>) => {
    setSafetySettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const addPrivateNote = useCallback(
    (note: Omit<PrivateIncidentNote, 'id' | 'referenceNumber' | 'createdAt' | 'isEncryptedLocally'>) => {
      const refNum = `INC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const newNote: PrivateIncidentNote = {
        ...note,
        id: `pin-${Date.now()}`,
        referenceNumber: refNum,
        createdAt: new Date().toISOString(),
        isEncryptedLocally: true
      };
      setPrivateNotes((prev) => [newNote, ...prev]);
      return newNote;
    },
    []
  );

  const deletePrivateNote = useCallback((id: string) => {
    setPrivateNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <SafetyContext.Provider
      value={{
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
        shakePermissionStatus,
        shakeCurrentCount,
        privateNotes,
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
        removeTrustedContact,
        updateTrustedContact,
        addPrivateNote,
        deletePrivateNote,
        fetchNearbySafetyAlerts
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
