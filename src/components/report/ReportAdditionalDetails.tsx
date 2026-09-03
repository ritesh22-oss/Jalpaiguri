import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Info
} from 'lucide-react';
import { CivicSeverity } from '../../types';

interface ReportAdditionalDetailsProps {
  landmark: string;
  onChangeLandmark: (val: string) => void;
  noticedWhen: string;
  onChangeNoticedWhen: (val: string) => void;
  severity: CivicSeverity;
  onChangeSeverity: (val: CivicSeverity) => void;
}

interface SeverityItem {
  id: CivicSeverity;
  label: string;
  subtitle: string;
  badgeBg: string;
  badgeDarkBg: string;
  borderActive: string;
  textCol: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SEVERITY_LEVELS: SeverityItem[] = [
  {
    id: 'Low',
    label: 'Low Severity',
    subtitle: 'Routine issue or minor aesthetic defect',
    badgeBg: 'bg-slate-100',
    badgeDarkBg: 'dark:bg-slate-800',
    borderActive: 'border-slate-500',
    textCol: 'text-slate-700 dark:text-slate-300',
    icon: Info
  },
  {
    id: 'Medium',
    label: 'Medium Severity',
    subtitle: 'Inconvenience to pedestrians or daily traffic',
    badgeBg: 'bg-amber-100',
    badgeDarkBg: 'dark:bg-amber-950/60',
    borderActive: 'border-amber-500',
    textCol: 'text-amber-700 dark:text-amber-400',
    icon: AlertTriangle
  },
  {
    id: 'High',
    label: 'High Severity',
    subtitle: 'Hazardous condition requiring priority team',
    badgeBg: 'bg-orange-100',
    badgeDarkBg: 'dark:bg-orange-950/60',
    borderActive: 'border-orange-500',
    textCol: 'text-orange-700 dark:text-orange-400',
    icon: Flame
  },
  {
    id: 'Critical',
    label: 'Critical / Urgent',
    subtitle: 'Immediate danger, live electrical wire or severe flood',
    badgeBg: 'bg-rose-100',
    badgeDarkBg: 'dark:bg-rose-950/60',
    borderActive: 'border-rose-600',
    textCol: 'text-rose-700 dark:text-rose-400',
    icon: ShieldAlert
  }
];

const NOTICED_OPTIONS = [
  'Just now',
  'Earlier today',
  'A few days ago',
  'Ongoing (1+ week)'
];

export const ReportAdditionalDetails: React.FC<ReportAdditionalDetailsProps> = ({
  landmark,
  onChangeLandmark,
  noticedWhen,
  onChangeNoticedWhen,
  severity,
  onChangeSeverity
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl overflow-hidden transition-colors shadow-xs">
      <button
        type="button"
        id="btn-toggle-optional-details"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF8F5] dark:hover:bg-[#1A2A22] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA] flex items-center justify-center text-[10px] font-bold">5</span>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#11241C] dark:text-white">
              Additional Details <span className="text-[11px] font-normal text-[#55685F] dark:text-[#A2B3AA] lowercase">(optional)</span>
            </h4>
            <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
              Severity, landmarks & timeline for faster dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#063B2C] dark:text-emerald-400">
          <span className="text-[11px]">{isOpen ? 'Hide' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-[#F2EFE8] dark:border-white/5 animate-in fade-in duration-150">
          {/* 1. Landmark or Nearby Area */}
          <div className="space-y-1.5 pt-3">
            <label className="text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
              Nearest Landmark / Spot
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => onChangeLandmark(e.target.value)}
              placeholder="e.g. Opposite Kadamtala Girls High School, Next to SBI ATM"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 rounded-xl text-xs font-medium text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
            />
          </div>

          {/* 2. When did you notice it? */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
              When was this first noticed?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NOTICED_OPTIONS.map((opt) => {
                const isSelected = noticedWhen === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChangeNoticedWhen(opt)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#063B2C] dark:bg-emerald-600 text-white border-[#063B2C] dark:border-emerald-600 shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-[#121E19] text-[#11241C] dark:text-white border-[#E4DFD3] dark:border-white/10 hover:bg-[#F2EFE8] dark:hover:bg-[#1A2A22]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. How serious is the issue? (Severity cards) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
              Issue Urgency & Severity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEVERITY_LEVELS.map((sev) => {
                const isSelected = severity === sev.id;
                const IconComp = sev.icon;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => onChangeSeverity(sev.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? `bg-white dark:bg-[#1A2A22] ${sev.borderActive} ring-2 ring-[#063B2C]/10 dark:ring-emerald-500/20 shadow-xs`
                        : 'bg-[#FAF8F5] dark:bg-[#121E19] border-[#E4DFD3] dark:border-white/10 hover:bg-[#F2EFE8] dark:hover:bg-[#1A2A22]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${sev.badgeBg} ${sev.badgeDarkBg} flex items-center justify-center shrink-0`}>
                        <IconComp className={`w-3.5 h-3.5 ${sev.textCol}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#11241C] dark:text-white' : 'text-[#55685F] dark:text-[#A2B3AA]'}`}>
                          {sev.label}
                        </p>
                        <p className="text-[10px] text-[#8C9B93] dark:text-[#A2B3AA] leading-tight truncate">
                          {sev.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
