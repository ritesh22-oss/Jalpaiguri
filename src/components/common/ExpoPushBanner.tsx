import React from 'react';
import { MessageSquare, Bell, Zap, Copy, X, Check } from 'lucide-react';
import { useExpo } from '../../context/ExpoContext';

export const ExpoPushBanner: React.FC = () => {
  const { pushNotification, dismissPushNotification, requestAutoFill } = useExpo();
  const [copied, setCopied] = React.useState(false);

  if (!pushNotification) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pushNotification.code) {
      navigator.clipboard.writeText(pushNotification.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAutoFillClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pushNotification.code) {
      requestAutoFill(pushNotification.code);
    } else if (pushNotification.onAction) {
      pushNotification.onAction();
      dismissPushNotification();
    }
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-50 animate-in slide-in-from-top duration-300">
      <div
        onClick={handleAutoFillClick}
        className="w-full bg-black/85 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-white/15 cursor-pointer hover:bg-black/90 transition-all select-none"
      >
        {/* Top Header line: Icon, App Name, Time */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-[#2F74E9] flex items-center justify-center text-white shadow-xs">
              {pushNotification.category === 'SMS' ? (
                <MessageSquare className="w-3 h-3 fill-white" />
              ) : (
                <Bell className="w-3 h-3 fill-white" />
              )}
            </div>
            <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-300">
              {pushNotification.appTitle}
            </span>
            <span className="text-[10px] text-gray-400">•</span>
            <span className="text-[10px] text-gray-400">{pushNotification.timeText}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissPushNotification();
            }}
            className="p-1 -mr-1 text-gray-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Body */}
        <div className="pt-2">
          <p className="text-xs font-bold text-white tracking-tight">
            {pushNotification.title}
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">
            {pushNotification.body}
          </p>
        </div>

        {/* Quick Action Pills if OTP code is present */}
        {pushNotification.code && (
          <div className="flex items-center gap-2 mt-2.5 pt-1">
            <button
              type="button"
              onClick={handleAutoFillClick}
              className="flex-1 h-7 rounded-lg bg-[#2F74E9] hover:bg-[#2563EB] active:scale-95 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Auto-Fill {pushNotification.code}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="h-7 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-300" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
