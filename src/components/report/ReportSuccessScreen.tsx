import React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Home,
  FileText
} from 'lucide-react';
import { CivicReport } from '../../types';

interface ReportSuccessScreenProps {
  report: CivicReport;
  onTrackStatus: () => void;
  onReportAnother: () => void;
  onGoHome: () => void;
}

export const ReportSuccessScreen: React.FC<ReportSuccessScreenProps> = ({
  report,
  onTrackStatus,
  onReportAnother,
  onGoHome
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] p-5 flex flex-col justify-between max-w-md mx-auto select-none transition-colors">
      <div className="pt-8 space-y-6">
        {/* Success Icon badge */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#063B2C] dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-800/60 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-11 h-11 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
            Report Submitted Successfully!
          </h2>

          <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed max-w-[300px] mx-auto">
            Thank you for helping improve Jalpaiguri. Your report has been dispatched to the municipal ward grievance portal.
          </p>
        </div>

        {/* Report Summary Card */}
        <div className="bg-white dark:bg-[#16241F] rounded-3xl p-5 border border-[#E4DFD3] dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE8] dark:border-white/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B93] dark:text-[#A2B3AA]">
                Official Reference ID
              </span>
              <p className="text-base font-black font-mono text-[#063B2C] dark:text-emerald-400 mt-0.5">
                {report.id}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              Submitted
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Category:
              </span>
              <span className="font-bold text-[#11241C] dark:text-white">
                {report.category}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <span className="text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5" /> Location:
              </span>
              <span className="font-bold text-[#11241C] dark:text-white text-right truncate max-w-[200px]">
                {report.location}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time Logged:
              </span>
              <span className="font-bold text-[#11241C] dark:text-white">
                {report.reportedAt || 'Just now'}
              </span>
            </div>
          </div>

          {/* Quick Tracking Preview */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#121E19] rounded-2xl border border-[#E4DFD3] dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#11241C] dark:text-white">
              <span className="flex items-center gap-1 text-[#063B2C] dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Next: Ward Officer Verification
              </span>
              <span className="text-[10px] text-[#8C9B93]">Estimated ~2 hrs</span>
            </div>
            <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
              The assigned sanitary / engineering supervisor will inspect the location and update resolution progress.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pb-6 pt-4">
        <button
          type="button"
          id="btn-success-track"
          onClick={onTrackStatus}
          className="w-full py-4 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] dark:hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Track Status & Progress</span>
        </button>

        <button
          type="button"
          id="btn-success-another"
          onClick={onReportAnother}
          className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#16241F] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs hover:bg-[#FAF8F5] dark:hover:bg-[#1C2C24] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
          <span>Report Another Issue</span>
        </button>

        <button
          type="button"
          id="btn-success-home"
          onClick={onGoHome}
          className="w-full py-3 rounded-2xl text-[#55685F] dark:text-[#A2B3AA] font-bold text-xs hover:text-[#11241C] dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
