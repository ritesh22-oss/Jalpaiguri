import React from 'react';
import { X, QrCode, Smartphone, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useExpo } from '../../context/ExpoContext';

export const ExpoQrModal: React.FC = () => {
  const { isQrModalOpen, setQrModalOpen, triggerHaptic } = useExpo();
  const [copied, setCopied] = React.useState(false);

  if (!isQrModalOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://jalpaiguri-connect.expo.dev';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate QR code SVG using Google Chart API or inline vector
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            setQrModalOpen(false);
            triggerHaptic('light');
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Expo Header */}
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white mb-3 shadow-md">
          <Smartphone className="w-6 h-6 text-white" />
        </div>

        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Expo Go & Mobile Testing</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900">Scan to Open on Mobile</h3>
        <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
          Open the Camera app on your iPhone or Android to test Jalpaiguri Connect live on your phone.
        </p>

        {/* QR Code Container */}
        <div className="mt-4 p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-inner">
          <img
            src={qrCodeUrl}
            alt="Expo QR Code"
            className="w-48 h-48 rounded-xl object-contain"
          />
        </div>

        {/* URL Link and Copy Action */}
        <div className="w-full mt-4 flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-left overflow-hidden">
            <p className="text-[10px] uppercase font-bold text-gray-400">Development URL</p>
            <p className="text-xs font-mono text-gray-800 truncate">{currentUrl}</p>
          </div>

          <button
            onClick={handleCopyUrl}
            className="h-10 px-3.5 rounded-xl bg-black hover:bg-gray-800 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => window.open(currentUrl, '_blank')}
          className="w-full mt-2 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          <span>Open in New Browser Tab</span>
        </button>
      </div>
    </div>
  );
};
