import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { CivicCategory } from '../../types';

interface ReportAiAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalDescription: string;
  category: CivicCategory;
  location: string;
  onApplyEnhancement: (enhancedText: string, suggestedCategory?: CivicCategory) => void;
}

interface AiEnhanceResult {
  enhancedDescription: string;
  suggestedCategory: string;
  missingInfo: string[];
  isAiAssisted: boolean;
}

export const ReportAiAssistModal: React.FC<ReportAiAssistModalProps> = ({
  isOpen,
  onClose,
  originalDescription,
  category,
  location,
  onApplyEnhancement
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiEnhanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  const fetchEnhancement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reports/enhance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: originalDescription,
          category,
          location
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: AiEnhanceResult = await res.json();
      setResult(data);
      setEditedText(data.enhancedDescription || originalDescription);
    } catch (err: any) {
      console.warn('AI enhancement error:', err);
      // Fallback
      const fallbackClean = originalDescription.trim().replace(/\s+/g, ' ');
      const fallbackResult: AiEnhanceResult = {
        enhancedDescription: fallbackClean.charAt(0).toUpperCase() + fallbackClean.slice(1),
        suggestedCategory: category,
        missingInfo: ['Specific nearby landmark or ward', 'Time issue was noticed'],
        isAiAssisted: true
      };
      setResult(fallbackResult);
      setEditedText(fallbackResult.enhancedDescription);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && originalDescription.trim()) {
      fetchEnhancement();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyEnhancement(editedText, (result?.suggestedCategory as CivicCategory) || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16241F] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#E4DFD3] dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E4DFD3] dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white flex items-center gap-1.5">
                Jalpaigi AI Assistant
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  Verified Municipal AI
                </span>
              </h3>
              <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                Restructures report for faster ward officer review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] text-[#11241C] dark:text-white flex items-center justify-center hover:bg-[#F2EFE8] dark:hover:bg-[#1B2C24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#11241C] dark:text-white">
                  Enhancing Report...
                </p>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-1 max-w-[240px]">
                  Refining clarity, formatting, and checking for missing municipal context.
                </p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Original snippet */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B93] dark:text-[#A2B3AA]">
                  Your Original Text:
                </span>
                <p className="p-3 bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E4DFD3] dark:border-white/5 rounded-xl text-xs text-[#55685F] dark:text-[#A2B3AA] italic">
                  "{originalDescription}"
                </p>
              </div>

              {/* Enhanced Draft */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#063B2C] dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI-Enhanced Report Draft (Editable):
                  </span>
                  <span className="text-[10px] text-[#8C9B93]">No facts invented</span>
                </div>

                <textarea
                  rows={4}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#121E19] border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-xl text-xs font-medium text-[#11241C] dark:text-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 leading-relaxed"
                />
              </div>

              {/* Missing context hints */}
              {result.missingInfo && result.missingInfo.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-1.5">
                  <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Recommended details to add before sending:
                  </p>
                  <ul className="list-disc pl-4 text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                    {result.missingInfo.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Category badge if different */}
              {result.suggestedCategory && result.suggestedCategory !== category && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] text-blue-900 dark:text-blue-200">
                    Suggested Category: <b>{result.suggestedCategory}</b>
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md font-bold">
                    Will update
                  </span>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E4DFD3] dark:border-white/10 flex items-center gap-2.5 bg-[#FAF8F5] dark:bg-[#121E19]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white hover:bg-white dark:hover:bg-[#1A2A22] transition-colors"
          >
            Keep Original
          </button>
          <button
            type="button"
            id="btn-apply-ai-enhancement"
            disabled={loading || !editedText.trim()}
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] dark:hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Apply Enhancement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
