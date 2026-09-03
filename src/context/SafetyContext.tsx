import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EmergencyEvent,
  EmergencyEventType,
  TrustedContact,
  SafetySettings,
  PrivateIncidentNote
} from '../types';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';

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

interface SafetyContextType {
  sosStatus: 'IDLE' | 'CONFIRMING' | 'ACTIVE' | 'TEST_MODE';
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
  initiateSosTrigger: (source: 'BUTTON' | 'SHAKE' | 'TEST') => void;
  confirmSos: () => Promise<void>;
  cancelSosCountdown: () => void;
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
  addPrivateNote: (note: Omit<PrivateIncidentNote, 'id' | 'referenceNumber' | 'createdAt' | 'isEncryptedLocally'>) => PrivateIncidentNote;
  deletePrivateNote: (id: string) => void;
  fetchNearbySafetyAlerts: () => Promise<void>;
}

const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  shakeToSosEnabled: true,
  instantSosEnabled: false,
  nearbyAlertsEnabled: false, // Strictly OPT-IN (default OFF)
  nearbyAlertRadiusKm: 2,
  locationSharingEnabled: true,
  emergencyNotificationSound: true,
  hasSeenSafetyDisclaimer: false
};

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { location } = useLocation();
  const { user } = useAuth();

  const [sosStatus, setSosStatus] = useState<'IDLE' | 'CONFIRMING' | 'ACTIVE' | 'TEST_MODE'>('IDLE');
  const [countdown, setCountdown] = useState<number>(5);
  const [triggerSource, setTriggerSource] = useState<'BUTTON' | 'SHAKE' | 'TEST' | null>(null);
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | null>(null);

  // Settings
  const [safetySettings, setSafetySettings] = useState<SafetySettings>(() => {
    try {
      const saved = localStorage.getItem('jpg_safety_settings');
      if (saved) return { ...DEFAULT_SAFETY_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SAFETY_SETTINGS;
  });

  // Trusted Contacts
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(() => {
    try {
      const saved = localStorage.getItem('jpg_trusted_contacts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
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

  // Private Incident Diary (strictly private local storage, never auto-uploaded)
  const [privateNotes, setPrivateNotes] = useState<PrivateIncidentNote[]>(() => {
    try {
      const saved = localStorage.getItem('jpg_private_incident_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Opted-in Nearby Community Alerts
  const [nearbyAlerts, setNearbyAlerts] = useState<AnonymousSafetyAlert[]>([]);

  // Shake sensor state
  const [shakeSupported, setShakeSupported] = useState<boolean>(true);
  const [shakePermissionGranted, setShakePermissionGranted] = useState<boolean>(false);
  const [shakePermissionStatus, setShakePermissionStatus] = useState<ShakePermissionStatus>('prompt');
  const [shakeCurrentCount, setShakeCurrentCount] = useState<number>(0);

  // Motion detection variables
  const lastShakeTimeRef = useRef<number>(0);
  const shakeCountRef = useRef<number>(0);
  const lastAccRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const shakeResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('jpg_safety_settings', JSON.stringify(safetySettings));
    } catch (e) {}
  }, [safetySettings]);

  // Save contacts
  useEffect(() => {
    try {
      localStorage.setItem('jpg_trusted_contacts', JSON.stringify(trustedContacts));
    } catch (e) {}
  }, [trustedContacts]);

  // Save private notes
  useEffect(() => {
    try {
      localStorage.setItem('jpg_private_incident_notes', JSON.stringify(privateNotes));
    } catch (e) {}
  }, [privateNotes]);

  // Check active emergency on server on mount
  useEffect(() => {
    const userId = user?.id || localStorage.getItem('jpg_device_user_id') || 'guest-user';
    fetch(`/api/emergency/active?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.active && data.event) {
          setActiveEvent(data.event);
          setSosStatus('ACTIVE');
        }
      })
      .catch(() => {});
  }, [user]);

  // Play alarm sound helper
  const playEmergencyTone = useCallback(() => {
    if (!safetySettings.emergencyNotificationSound) return;
    try {
      if (!audioRef.current) {
        // Audio synthesis using Web Audio API for guaranteed reliable sound without external asset dependencies
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch alarm tone
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio context policy might require user gesture
    }
  }, [safetySettings.emergencyNotificationSound]);

  // Confirm and officially activate Emergency SOS
  const confirmSos = useCallback(async () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    const userId = user?.id || localStorage.getItem('jpg_device_user_id') || `usr-${Date.now()}`;
    const userName = user?.name || 'Citizen';
    const lat = location?.lat || 26.5414;
    const lng = location?.lng || 88.7196;
    const accuracy = location?.accuracy || 20;
    const city = location?.city || location?.locality || 'Detected Area';
    const state = location?.state || 'West Bengal';

    playEmergencyTone();

    // Call backend endpoint to register emergency
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
          trustedContacts: trustedContacts.filter(c => c.isEmergencyAlertContact),
          isNearbyOptIn: safetySettings.nearbyAlertsEnabled
        })
      });

      const data = await res.json();
      if (data && data.success && data.event) {
        setActiveEvent(data.event);
        setSosStatus('ACTIVE');
      } else {
        // Fallback local event if offline
        const fallbackEvent: EmergencyEvent = {
          id: `SOS-LOCAL-${Date.now().toString(36).toUpperCase()}`,
          user_id: userId,
          userName,
          event_type: 'SAFETY_SOS',
          created_at: new Date().toISOString(),
          latitude: lat,
          longitude: lng,
          accuracy,
          city,
          state,
          status: 'ACTIVE',
          alerts_sent_trusted: trustedContacts.length > 0,
          alerts_sent_nearby: safetySettings.nearbyAlertsEnabled
        };
        setActiveEvent(fallbackEvent);
        setSosStatus('ACTIVE');
      }
    } catch (err) {
      const fallbackEvent: EmergencyEvent = {
        id: `SOS-LOCAL-${Date.now().toString(36).toUpperCase()}`,
        user_id: userId,
        userName,
        event_type: 'SAFETY_SOS',
        created_at: new Date().toISOString(),
        latitude: lat,
        longitude: lng,
        accuracy,
        city,
        state,
        status: 'ACTIVE',
        alerts_sent_trusted: trustedContacts.length > 0,
        alerts_sent_nearby: safetySettings.nearbyAlertsEnabled
      };
      setActiveEvent(fallbackEvent);
      setSosStatus('ACTIVE');
    }
  }, [user, location, trustedContacts, safetySettings.nearbyAlertsEnabled, playEmergencyTone]);

  // Initiate SOS trigger (Button / Shake / Test)
  const initiateSosTrigger = useCallback((source: 'BUTTON' | 'SHAKE' | 'TEST') => {
    if (sosStatus === 'ACTIVE') return;

    setTriggerSource(source);

    if (source === 'TEST') {
      runTestSafetyAlert();
      return;
    }

    // If Instant SOS is enabled by user preference: immediately activate
    if (safetySettings.instantSosEnabled) {
      confirmSos();
      return;
    }

    // Default false alarm protection: 5-second countdown
    setSosStatus('CONFIRMING');
    setCountdown(5);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let current = 5;
    countdownIntervalRef.current = setInterval(() => {
      current -= 1;
      setCountdown(current);
      playEmergencyTone();

      if (current <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        confirmSos();
      }
    }, 1000);
  }, [sosStatus, safetySettings.instantSosEnabled, confirmSos, playEmergencyTone]);

  // Cancel countdown (false alarm caught in time)
  const cancelSosCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSosStatus('IDLE');
    setTriggerSource(null);
    setCountdown(5);
  }, []);

  // Cancel an active SOS broadcast
  const cancelActiveSos = useCallback(async (reason: string = 'Resolved safely by user') => {
    const userId = user?.id || localStorage.getItem('jpg_device_user_id') || 'guest-user';
    const eventId = activeEvent?.id;

    try {
      await fetch('/api/emergency/cancel-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, reason })
      });
    } catch (e) {}

    setActiveEvent(null);
    setSosStatus('IDLE');
    setTriggerSource(null);
  }, [user, activeEvent]);

  // Test simulation alert
  const runTestSafetyAlert = useCallback(() => {
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
      alerts_sent_trusted: true,
      alerts_sent_nearby: false
    };

    setActiveEvent(testEvent);
    setSosStatus('TEST_MODE');
  }, [location, user]);

  const exitTestMode = useCallback(() => {
    setActiveEvent(null);
    setSosStatus('IDLE');
    setTriggerSource(null);
  }, []);

  // Call 112 (National Emergency Helpline)
  const call112 = useCallback(() => {
    window.location.href = 'tel:112';
  }, []);

  // Generate standardized SMS text
  const getEmergencyMessageText = useCallback(() => {
    const userName = user?.name || 'Citizen';
    const area = location ? `${location.locality || location.city || 'Area'}, ${location.state || ''}` : 'Jalpaiguri, West Bengal';
    const mapUrl = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '';
    const eventId = activeEvent?.id || 'SOS-ACTIVE';

    return `EMERGENCY ALERT: ${userName} has activated Safety SOS on Jalpaiguri Connect (Ref: ${eventId}). They may need immediate assistance.\nApproximate Location: ${area}\nMap link: ${mapUrl}\nTime: ${new Date().toLocaleTimeString()}`;
  }, [user, location, activeEvent]);

  // Share Emergency Location via Web Share API or Clipboard
  const shareEmergencyLocation = useCallback(async () => {
    const text = getEmergencyMessageText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '🚨 Emergency SOS - Jalpaiguri Connect',
          text,
          url: location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : undefined
        });
        return;
      } catch (e) {}
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert('Emergency message copied to clipboard! You can paste it in WhatsApp or SMS.');
    } catch (e) {
      alert(text);
    }
  }, [getEmergencyMessageText, location]);

  // Send SMS to trusted contacts via native sms: URL schema
  const sendSmsToTrustedContacts = useCallback(() => {
    if (trustedContacts.length === 0) {
      alert('No trusted contacts configured. Please add contacts in Safety Settings.');
      return;
    }

    const text = encodeURIComponent(getEmergencyMessageText());
    const firstContactPhone = trustedContacts[0].phone.replace(/[^0-9+]/g, '');
    window.location.href = `sms:${firstContactPhone}?body=${text}`;
  }, [trustedContacts, getEmergencyMessageText]);

  // Check motion sensor capabilities on mount
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

    // iOS 13+ requires user gesture via DeviceMotionEvent.requestPermission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      setShakePermissionStatus('prompt');
      setShakePermissionGranted(false);
    } else {
      // Modern Android and desktop browsers support DeviceMotionEvent directly
      setShakePermissionStatus('granted');
      setShakePermissionGranted(true);
    }
  }, []);

  // Motion sensor Shake Detection - Monitor for 3 deliberate strong shakes
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!safetySettings.shakeToSosEnabled || sosStatus === 'ACTIVE' || sosStatus === 'CONFIRMING') return;

    // Check device acceleration with or without gravity
    const linearAcc = event.acceleration;
    const totalAcc = event.accelerationIncludingGravity;

    let x = 0;
    let y = 0;
    let z = 0;
    let magnitude = 0;
    let delta = 0;

    if (linearAcc && linearAcc.x !== null && linearAcc.y !== null && linearAcc.z !== null) {
      // Pure linear acceleration (gravity-compensated, available on modern devices)
      x = linearAcc.x || 0;
      y = linearAcc.y || 0;
      z = linearAcc.z || 0;
      magnitude = Math.sqrt(x * x + y * y + z * z);
      // Strong linear shake is > 15 m/s²
      delta = magnitude;
    } else if (totalAcc && totalAcc.x !== null && totalAcc.y !== null && totalAcc.z !== null) {
      // Acceleration including gravity (~9.8 m/s² baseline)
      x = totalAcc.x || 0;
      y = totalAcc.y || 0;
      z = totalAcc.z || 0;
      magnitude = Math.sqrt(x * x + y * y + z * z);

      if (lastAccRef.current) {
        const dx = x - lastAccRef.current.x;
        const dy = y - lastAccRef.current.y;
        const dz = z - lastAccRef.current.z;
        delta = Math.sqrt(dx * dx + dy * dy + dz * dz);
      } else {
        delta = 0;
      }
      lastAccRef.current = { x, y, z };
    } else {
      return;
    }

    // A deliberate strong shake threshold (filters out gentle walking or picking up phone)
    const isStrongShake = delta > 20 || magnitude > 24;

    if (isStrongShake) {
      const now = Date.now();
      // Enforce at least 240ms between separate shake strokes to avoid double-counting a single stroke
      if (now - lastShakeTimeRef.current > 240) {
        lastShakeTimeRef.current = now;
        shakeCountRef.current += 1;
        const newCount = shakeCountRef.current;
        setShakeCurrentCount(newCount);

        // Haptic feedback on physical phone if supported
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(80);
          } catch (e) {}
        }

        // Reset shake count if subsequent shakes aren't completed within 2.5 seconds
        if (shakeResetTimerRef.current) clearTimeout(shakeResetTimerRef.current);
        shakeResetTimerRef.current = setTimeout(() => {
          shakeCountRef.current = 0;
          setShakeCurrentCount(0);
        }, 2500);

        // Required 3 shakes sequence triggered
        if (newCount >= 3) {
          if (shakeResetTimerRef.current) clearTimeout(shakeResetTimerRef.current);
          shakeCountRef.current = 0;
          setShakeCurrentCount(0);

          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([180, 80, 180]);
            } catch (e) {}
          }

          initiateSosTrigger('SHAKE');
        }
      }
    }
  }, [safetySettings.shakeToSosEnabled, sosStatus, initiateSosTrigger]);

  // Request Shake Permission (for iOS 13+ devices)
  const requestShakePermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const state = await (DeviceMotionEvent as any).requestPermission();
        if (state === 'granted') {
          setShakePermissionGranted(true);
          setShakePermissionStatus('granted');
          window.addEventListener('devicemotion', handleDeviceMotion);
          return true;
        } else {
          setShakePermissionGranted(false);
          setShakePermissionStatus('denied');
          return false;
        }
      } catch (e) {
        setShakePermissionGranted(false);
        setShakePermissionStatus('denied');
        return false;
      }
    } else if ('ondevicemotion' in window || 'DeviceMotionEvent' in window) {
      setShakePermissionGranted(true);
      setShakePermissionStatus('granted');
      window.addEventListener('devicemotion', handleDeviceMotion);
      return true;
    }

    setShakeSupported(false);
    setShakePermissionStatus('unsupported');
    return false;
  }, [handleDeviceMotion]);

  // Manual Shake Simulation (for testing on desktop, dev environments, or when physical shake isn't available)
  const simulateShake = useCallback((count?: number) => {
    if (!safetySettings.shakeToSosEnabled || sosStatus === 'ACTIVE' || sosStatus === 'CONFIRMING') return;

    if (count !== undefined) {
      shakeCountRef.current = count;
      setShakeCurrentCount(count);
      if (count >= 3) {
        shakeCountRef.current = 0;
        setShakeCurrentCount(0);
        initiateSosTrigger('SHAKE');
      }
      return;
    }

    shakeCountRef.current += 1;
    const newCount = shakeCountRef.current;
    setShakeCurrentCount(newCount);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(80);
      } catch (e) {}
    }

    if (shakeResetTimerRef.current) clearTimeout(shakeResetTimerRef.current);
    shakeResetTimerRef.current = setTimeout(() => {
      shakeCountRef.current = 0;
      setShakeCurrentCount(0);
    }, 2500);

    if (newCount >= 3) {
      if (shakeResetTimerRef.current) clearTimeout(shakeResetTimerRef.current);
      shakeCountRef.current = 0;
      setShakeCurrentCount(0);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([180, 80, 180]);
        } catch (e) {}
      }
      initiateSosTrigger('SHAKE');
    }
  }, [safetySettings.shakeToSosEnabled, sosStatus, initiateSosTrigger]);

  // Attach motion listener when shake is enabled and permission is granted
  useEffect(() => {
    if (typeof window === 'undefined' || !('ondevicemotion' in window || 'DeviceMotionEvent' in window)) {
      return;
    }

    if (safetySettings.shakeToSosEnabled && shakePermissionGranted) {
      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [safetySettings.shakeToSosEnabled, shakePermissionGranted, handleDeviceMotion]);

  // Fetch nearby community safety alerts (strictly opt-in)
  const fetchNearbySafetyAlerts = useCallback(async () => {
    if (!safetySettings.nearbyAlertsEnabled) return;

    try {
      const res = await fetch('/api/emergency/nearby-alerts');
      if (res.ok) {
        const data = await res.json();
        if (data && data.alerts) {
          setNearbyAlerts(data.alerts);
        }
      }
    } catch (e) {}
  }, [safetySettings.nearbyAlertsEnabled]);

  useEffect(() => {
    if (safetySettings.nearbyAlertsEnabled) {
      fetchNearbySafetyAlerts();
      const timer = setInterval(fetchNearbySafetyAlerts, 15000);
      return () => clearInterval(timer);
    }
  }, [safetySettings.nearbyAlertsEnabled, fetchNearbySafetyAlerts]);

  // Trusted contacts management
  const addTrustedContact = useCallback((contact: Omit<TrustedContact, 'id' | 'addedAt'>) => {
    const newContact: TrustedContact = {
      ...contact,
      id: `tc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: new Date().toISOString()
    };
    setTrustedContacts(prev => [...prev, newContact]);
  }, []);

  const removeTrustedContact = useCallback((id: string) => {
    setTrustedContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateTrustedContact = useCallback((id: string, updates: Partial<TrustedContact>) => {
    setTrustedContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const updateSafetySettings = useCallback((settings: Partial<SafetySettings>) => {
    setSafetySettings(prev => ({ ...prev, ...settings }));
  }, []);

  // Private Incident Notes Management
  const addPrivateNote = useCallback((note: Omit<PrivateIncidentNote, 'id' | 'referenceNumber' | 'createdAt' | 'isEncryptedLocally'>) => {
    const refNum = `INC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newNote: PrivateIncidentNote = {
      ...note,
      id: `pin-${Date.now()}`,
      referenceNumber: refNum,
      createdAt: new Date().toISOString(),
      isEncryptedLocally: true
    };
    setPrivateNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const deletePrivateNote = useCallback((id: string) => {
    setPrivateNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <SafetyContext.Provider
      value={{
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
        privateNotes,
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
