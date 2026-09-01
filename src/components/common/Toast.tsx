import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#063B2C]" />,
    error: <AlertCircle className="w-5 h-5 text-[#D9383A]" />,
    info: <Info className="w-5 h-5 text-[#0A58CA]" />
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="bg-white/98 text-[#11241C] px-4 py-3.5 rounded-2xl shadow-xl border border-[#E8E4DA] flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
        {icons[toast.type]}
        <p className="text-xs font-semibold flex-1 leading-snug">
          {toast.message}
        </p>
      </div>
    </div>
  );
};
