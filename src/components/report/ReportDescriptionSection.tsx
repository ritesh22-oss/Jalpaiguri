import React from 'react';
import { FileText, AlertCircle, Sparkles } from 'lucide-react';
import { CivicCategory } from '../../types';

interface ReportDescriptionSectionProps {
  description: string;
  onChangeDescription: (desc: string) => void;
  category: CivicCategory;
  onOpenAiAssist: () => void;
  isAiAssisted?: boolean;
}

const CATEGORY_PROMPTS: Partial<Record<CivicCategory, string[]>> = {
  Road: [
    'Deep pothole causing hazards for two-wheelers.',
    'Road surface caved in near drainage canal.',
    'Unpaved rough patch after pipeline excavation.'
  ],
  Streetlight: [
    'Streetlight fixture not functioning after 7 PM.',
    'Lamp flickering continuously near crossing.',
    'Electric pole leaning with broken bulb shield.'
  ],
  Garbage: [
    'Municipal vat overflowing onto the pedestrian pathway.',
    'Illegal dumping of plastic waste near water channel.',
    'Garbage not collected for the past 3 days.'
  ],
  Water: [
    'Drinking water pipeline leaking on main road.',
    'Low water pressure during municipal supply hours.',
    'Discolored / muddy tap water supply in the area.'
  ],
  Flooding: [
    'Street inundated with knee-deep water after rain.',
    'Water accumulation blocking hospital / school approach.',
    'Severe backflow of water onto residential gates.'
  ],
  Electricity: [
    'Loose overhead cable hanging dangerously low.',
    'Transformer sparking near roadside market.',
    'Frequent unnotified voltage fluctuation in neighborhood.'
  ],
  Drainage: [
    'Roadside open drain blocked with silt and debris.',
    'Stagnant drain water overflowing onto the road.',
    'Broken concrete slab covering drainage channel.'
  ],
  Sewage: [
    'Uncovered manhole posing severe hazard to pedestrians.',
    'Sewage overflow causing intolerable foul smell.',
    'Underground drainage line blocked and backing up.'
  ]
};

export const ReportDescriptionSection: React.FC<ReportDescriptionSectionProps> = ({
  description,
  onChangeDescription,
  category,
  onOpenAiAssist,
  isAiAssisted = false
}) => {
  const charCount = description.trim().length;
  const minChars = 15;
  const maxChars = 1000;
  const isTooShort = charCount > 0 && charCount < minChars;
  const suggestions = CATEGORY_PROMPTS[category] || [
    'Issue has been persisting for multiple days.',
    'Causing severe disruption to daily traffic and pedestrians.',
    'Requires immediate on-site inspection by municipal crew.'
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-[#11241C] dark:text-white flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">4</span>
          Issue Description <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {isAiAssisted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3 h-3" /> AI-Assisted
            </span>
          )}
          <span
            className={`text-[11px] font-mono font-bold ${
              charCount < minChars
                ? 'text-[#8C9B93] dark:text-[#A2B3AA]'
                : charCount > maxChars
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-[#063B2C] dark:text-emerald-400'
            }`}
          >
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl p-3.5 transition-colors space-y-3 shadow-xs">
        <div className="relative">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                onChangeDescription(e.target.value);
              }
            }}
            placeholder="Describe the problem in detail… (What happened, exact spot, how it affects citizens)"
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Validation hint if too short */}
        {isTooShort && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-1 border-t border-[#F2EFE8] dark:border-white/5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Please write at least {minChars} characters ({minChars - charCount} more needed)</span>
          </div>
        )}

        {/* Helper & AI Assist bar */}
        <div className="pt-2 border-t border-[#F2EFE8] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
            Tell us what happened, where it happened, and any details that help resolve it.
          </p>

          <button
            type="button"
            id="btn-trigger-ai-assist"
            onClick={onOpenAiAssist}
            disabled={charCount < 5}
            className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/40 text-[#063B2C] dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Enhance with Jalpaigi AI</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-[#F2EFE8] dark:border-white/5 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B93] dark:text-[#A2B3AA]">
            Quick suggestions (tap to insert):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const combined = description ? `${description.trim()} ${sug}` : sug;
                  if (combined.length <= maxChars) {
                    onChangeDescription(combined);
                  }
                }}
                className="text-[11px] py-1 px-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#121E19] hover:bg-[#F2EFE8] dark:hover:bg-[#1C2C24] border border-[#E4DFD3] dark:border-white/5 text-[#55685F] dark:text-[#A2B3AA] text-left transition-colors cursor-pointer"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
