import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw, Volume2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WritingCaptchaProps {
  onVerifyChange: (isValid: boolean) => void;
  inputClassName?: string;
}

// Alphanumeric character set excluding ambiguous characters (0, O, 1, I, l)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCode(length = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
}

export const WritingCaptcha: React.FC<WritingCaptchaProps> = ({
  onVerifyChange,
  inputClassName = ''
}) => {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw the security code on the canvas with distortion, angles, and contrast
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient with subtle security wave
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F1F5F9');
    grad.addColorStop(0.5, '#E2E8F0');
    grad.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid noise
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = '#CBD5E1';
    for (let x = 0; x < width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Random security curve lines
    const colors = ['#0F766E', '#1D4ED8', '#B45309', '#4338CA', '#0369A1', '#BE185D'];
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = colors[i % colors.length] + '55';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.3, Math.random() * height,
        width * 0.7, Math.random() * height,
        width - Math.random() * 20, Math.random() * height
      );
      ctx.stroke();
    }

    // Draw individual characters with slight rotations
    const charSpacing = (width - 24) / code.length;
    const startX = 14;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();

      const charX = startX + i * charSpacing + (Math.random() * 4 - 2);
      const charY = height / 2 + 7 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180);

      ctx.translate(charX, charY);
      ctx.rotate(angle);

      // Distinct bold typography
      const fonts = ['bold 22px monospace', 'bold 24px sans-serif', 'bold 23px ui-monospace'];
      ctx.font = fonts[i % fonts.length];
      ctx.fillStyle = colors[(i * 2 + 1) % colors.length];
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Subtle noise dots
    for (let d = 0; d < 30; d++) {
      ctx.fillStyle = colors[d % colors.length] + '40';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    setIsRotating(true);
    const newCode = generateRandomCode(5);
    setCaptchaText(newCode);
    setUserInput('');
    onVerifyChange(false);
    setTimeout(() => setIsRotating(false), 400);
  }, [onVerifyChange]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    if (captchaText) {
      drawCaptcha(captchaText);
    }
  }, [captchaText, drawCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    setUserInput(val);

    const isMatch = val === captchaText && val.length === 5;
    onVerifyChange(isMatch);
  };

  // Speak the CAPTCHA characters clearly aloud
  const handleSpeakCaptcha = () => {
    if (!('speechSynthesis' in window) || !captchaText) return;

    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const spacedOutText = captchaText.split('').join('. ');
      const utterance = new SpeechSynthesisUtterance(`Security code is: ${spacedOutText}`);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (_) {
      setIsSpeaking(false);
    }
  };

  const isMatched = userInput === captchaText && userInput.length === 5;

  return (
    <div className="w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Security Code (Type the characters)</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio voice pronounce button */}
          <button
            type="button"
            onClick={handleSpeakCaptcha}
            title="Read security code aloud"
            aria-label="Read code aloud"
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`} />
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={refreshCaptcha}
            title="Get a new security code"
            aria-label="Refresh security code"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        {/* Canvas Visual Display */}
        <div className="relative rounded-xl overflow-hidden border border-gray-300/80 shadow-2xs bg-slate-100 flex items-center justify-center select-none">
          <canvas
            ref={canvasRef}
            width={170}
            height={44}
            className="w-full h-[44px] block object-contain"
          />
        </div>

        {/* Text Typing Input */}
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type code"
            maxLength={5}
            autoComplete="off"
            spellCheck={false}
            className={`w-full h-[44px] px-3 font-mono font-bold text-sm tracking-widest uppercase bg-white border rounded-xl focus:outline-none transition-all ${
              isMatched
                ? 'border-emerald-500 ring-2 ring-emerald-100 text-emerald-800'
                : userInput.length === 5
                ? 'border-rose-400 ring-2 ring-rose-100 text-rose-800'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900'
            } ${inputClassName}`}
          />

          {isMatched && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {userInput.length > 0 && userInput.length === 5 && !isMatched && (
        <p className="text-[11px] text-rose-600 font-medium">
          Characters do not match. Please check or tap refresh.
        </p>
      )}
    </div>
  );
};
