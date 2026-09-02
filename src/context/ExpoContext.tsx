import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpoHaptics } from '../utils/expoHaptics';

export type ExpoDeviceType = 'iphone-16-pro' | 'pixel-9' | 'compact' | 'fullscreen';

export interface ExpoPushNotificationData {
  id: string;
  appTitle: string;
  category: 'SMS' | 'ALERT' | 'CIVIC' | 'BLOOD';
  title: string;
  body: string;
  code?: string;
  timeText: string;
  actionLabel?: string;
  onAction?: (code?: string) => void;
}

interface ExpoContextType {
  deviceType: ExpoDeviceType;
  setDeviceType: (device: ExpoDeviceType) => void;
  // Push Notification state
  pushNotification: ExpoPushNotificationData | null;
  triggerPushNotification: (notification: Omit<ExpoPushNotificationData, 'id' | 'timeText'>) => void;
  dismissPushNotification: () => void;
  // Active OTP code captured
  latestOtp: string | null;
  setLatestOtp: (code: string | null) => void;
  autoFillOtpTrigger: string | null;
  requestAutoFill: (code: string) => void;
  clearAutoFillRequest: () => void;
  // Dev Menu & QR Modal
  isDevMenuOpen: boolean;
  setDevMenuOpen: (open: boolean) => void;
  isQrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  // Settings
  isSoundEnabled: boolean;
  toggleSound: () => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  // Live Simulated Status
  simulatedTime: string;
  batteryLevel: number;
}

const ExpoContext = createContext<ExpoContextType | undefined>(undefined);

export const ExpoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceType, setDeviceTypeState] = useState<ExpoDeviceType>(() => {
    try {
      const saved = localStorage.getItem('expo_device_type');
      if (saved) return saved as ExpoDeviceType;
    } catch (_) {}
    return 'iphone-16-pro';
  });

  const [pushNotification, setPushNotification] = useState<ExpoPushNotificationData | null>(null);
  const [latestOtp, setLatestOtp] = useState<string | null>(null);
  const [autoFillOtpTrigger, setAutoFillOtpTrigger] = useState<string | null>(null);
  const [isDevMenuOpen, setDevMenuOpen] = useState<boolean>(false);
  const [isQrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [simulatedTime, setSimulatedTime] = useState<string>('9:41');
  const [batteryLevel] = useState<number>(94);

  const setDeviceType = (type: ExpoDeviceType) => {
    setDeviceTypeState(type);
    localStorage.setItem('expo_device_type', type);
    ExpoHaptics.impactAsync('light');
  };

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setSimulatedTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time EventSource listener for Server-Sent Events (SSE)
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('/api/realtime/stream');

      evtSource.addEventListener('otp_dispatched', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.otp) {
            setLatestOtp(data.otp);
            triggerPushNotification({
              appTitle: 'Messages',
              category: 'SMS',
              title: 'Jalpaiguri Connect Verification',
              body: `Your verification code is ${data.otp}. Do not share this code.`,
              code: data.otp,
              actionLabel: 'Auto-Fill OTP',
              onAction: (code) => {
                if (code) requestAutoFill(code);
              }
            });
          }
        } catch (_) {}
      });

      evtSource.addEventListener('alert_created', (e: MessageEvent) => {
        try {
          const alert = JSON.parse(e.data);
          triggerPushNotification({
            appTitle: 'Jalpaiguri Connect',
            category: 'ALERT',
            title: alert.title || 'Local Alert',
            body: alert.description || 'New civic announcement for your area.',
            actionLabel: 'View Alert'
          });
        } catch (_) {}
      });
    } catch (err) {
      console.warn('SSE initialization note:', err);
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  const triggerPushNotification = (
    notif: Omit<ExpoPushNotificationData, 'id' | 'timeText'>
  ) => {
    const newNotif: ExpoPushNotificationData = {
      ...notif,
      id: `expo_push_${Date.now()}`,
      timeText: 'now'
    };

    setPushNotification(newNotif);
    ExpoHaptics.playPushNotificationChime();
    ExpoHaptics.impactAsync('medium');

    // Auto dismiss after 9 seconds if not interacted
    setTimeout(() => {
      setPushNotification((current) => (current?.id === newNotif.id ? null : current));
    }, 9000);
  };

  const dismissPushNotification = () => {
    setPushNotification(null);
    ExpoHaptics.impactAsync('light');
  };

  const requestAutoFill = (code: string) => {
    setAutoFillOtpTrigger(code);
    ExpoHaptics.notificationAsync('success');
    dismissPushNotification();
  };

  const clearAutoFillRequest = () => {
    setAutoFillOtpTrigger(null);
  };

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    ExpoHaptics.setSoundEnabled(next);
    if (next) ExpoHaptics.impactAsync('medium');
  };

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (style === 'success' || style === 'warning' || style === 'error') {
      ExpoHaptics.notificationAsync(style);
    } else {
      ExpoHaptics.impactAsync(style);
    }
  };

  return (
    <ExpoContext.Provider
      value={{
        deviceType,
        setDeviceType,
        pushNotification,
        triggerPushNotification,
        dismissPushNotification,
        latestOtp,
        setLatestOtp,
        autoFillOtpTrigger,
        requestAutoFill,
        clearAutoFillRequest,
        isDevMenuOpen,
        setDevMenuOpen,
        isQrModalOpen,
        setQrModalOpen,
        isSoundEnabled,
        toggleSound,
        triggerHaptic,
        simulatedTime,
        batteryLevel
      }}
    >
      {children}
    </ExpoContext.Provider>
  );
};

export const useExpo = () => {
  const context = useContext(ExpoContext);
  if (!context) {
    throw new Error('useExpo must be used within an ExpoProvider');
  }
  return context;
};
