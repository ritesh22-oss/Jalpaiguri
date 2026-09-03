import React from 'react';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Share2,
  ShieldCheck,
  Building,
  UserCheck,
  Wrench,
  Archive,
  Search,
  Flame,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { CivicReport, CivicReportStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReportDetailsModalProps {
  report: CivicReport | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  CivicReportStatus,
  {
    label: string;
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  'Submitted': {
    label: 'Submitted',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-950/60 dark:border-blue-800/40',
    darkText: 'dark:text-blue-400',
    icon: Clock
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    darkBg: 'dark:bg-amber-950/60 dark:border-amber-800/40',
    darkText: 'dark:text-amber-400',
    icon: Search
  },
  'Assigned': {
    label: 'Assigned to Ward',
    bg: 'bg-indigo-50 border-indigo-200',
    text: 'text-indigo-700',
    darkBg: 'dark:bg-indigo-950/60 dark:border-indigo-800/40',
    darkText: 'dark:text-indigo-400',
    icon: UserCheck
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    darkBg: 'dark:bg-purple-950/60 dark:border-purple-800/40',
    darkText: 'dark:text-purple-400',
    icon: Wrench
  },
  'Action Taken': {
    label: 'Action Taken',
    bg: 'bg-teal-50 border-teal-200',
    text: 'text-teal-700',
    darkBg: 'dark:bg-teal-950/60 dark:border-teal-800/40',
    darkText: 'dark:text-teal-400',
    icon: Wrench
  },
  'Resolved': {
    label: 'Resolved',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    darkBg: 'dark:bg-emerald-950/60 dark:border-emerald-800/40',
    darkText: 'dark:text-emerald-400',
    icon: CheckCircle2
  },
  'Closed': {
    label: 'Closed',
    bg: 'bg-gray-100 border-gray-300',
    text: 'text-gray-700',
    darkBg: 'dark:bg-gray-800 dark:border-gray-700',
    darkText: 'dark:text-gray-300',
    icon: Archive
  }
};

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose
}) => {
  const { upvoteCivicReport, showToast } = useApp();

  if (!report) return null;

  const statusConfig = STATUS_CONFIG[report.status as CivicReportStatus] || STATUS_CONFIG['Submitted'];
  const StatusIcon = statusConfig.icon;

  // Build 5-step official municipal timeline
  const timelineSteps = [
    {
      title: '1. Report Submitted',
      date: report.reportedAt || 'Logged',
      desc: 'Registered with Jalpaiguri Municipal grievance cell',
      done: true,
      icon: Clock
    },
    {
      title: '2. Ward Officer Review',
      date: report.status !== 'Submitted' ? 'Completed' : 'Pending review',
      desc: 'Ward sanitary/engineering inspector review',
      done: report.status !== 'Submitted',
      icon: Search
    },
    {
      title: '3. Team Assigned',
      date: ['Assigned', 'In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(report.status) ? 'Dispatched' : 'Pending',
      desc: 'Maintenance or sanitation field crew scheduled',
      done: ['Assigned', 'In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(report.status),
      icon: UserCheck
    },
    {
      title: '4. Repair In Progress',
      date: ['In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(report.status) ? 'Active on site' : 'Pending',
      desc: 'On-ground repair / clearance in Jalpaiguri ward',
      done: ['In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(report.status),
      icon: Wrench
    },
    {
      title: '5. Verified & Resolved',
      date: report.status === 'Resolved' || report.status === 'Closed' ? 'Completed' : 'Expected 24-48 hrs',
      desc: 'Final site inspection and citizen closure',
      done: report.status === 'Resolved' || report.status === 'Closed',
      icon: CheckCircle2
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Civic Report: ${report.category} (${report.id})`,
        text: `Check civic report ${report.id} at ${report.location} on Jalpaiguri Connect`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText?.(`${report.id}: ${report.category} at ${report.location}`);
      showToast('Report reference copied to clipboard!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16241F] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#E4DFD3] dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E4DFD3] dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#8C9B93] dark:text-[#A2B3AA] uppercase tracking-wider">
              {report.id}
            </span>
            <h3 className="text-base font-extrabold text-[#11241C] dark:text-white flex items-center gap-2">
              {report.category} Issue
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] text-[#11241C] dark:text-white flex items-center justify-center hover:bg-[#F2EFE8] dark:hover:bg-[#1B2C24]"
              title="Share Report"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] text-[#11241C] dark:text-white flex items-center justify-center hover:bg-[#F2EFE8] dark:hover:bg-[#1B2C24]"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Status & Severity Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.darkBg} ${statusConfig.darkText}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </div>

            {report.severity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]">
                <Flame className="w-3 h-3 text-orange-500" />
                {report.severity} Priority
              </span>
            )}
          </div>

          {/* Media preview if attached */}
          {report.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#E4DFD3] dark:border-white/10 bg-black/5 dark:bg-black/40 max-h-56">
              {report.mediaType === 'video' ? (
                <video
                  src={report.photoUrl}
                  controls
                  className="max-h-56 w-full object-contain bg-black"
                />
              ) : (
                <img
                  src={report.photoUrl}
                  alt={report.category}
                  className="max-h-56 w-full object-cover"
                />
              )}
            </div>
          )}

          {/* Description */}
          <div className="bg-[#FAF8F5] dark:bg-[#121E19] p-3.5 rounded-2xl border border-[#E4DFD3] dark:border-white/5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B93] dark:text-[#A2B3AA]">
              Problem Statement
            </span>
            <p className="text-xs text-[#11241C] dark:text-white leading-relaxed font-medium">
              "{report.description}"
            </p>
            {report.aiAssisted && (
              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                ✨ Enhanced with Jalpaigi AI
              </span>
            )}
          </div>

          {/* Location & Details Card */}
          <div className="p-3.5 bg-white dark:bg-[#14231D] rounded-2xl border border-[#E4DFD3] dark:border-white/10 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#063B2C] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#11241C] dark:text-white">
                  {report.location}
                </p>
                {report.landmark && (
                  <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    Landmark: <b>{report.landmark}</b>
                  </p>
                )}
                {report.noticedWhen && (
                  <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    First noticed: {report.noticedWhen}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Timeline */}
          <div className="p-4 bg-white dark:bg-[#14231D] rounded-2xl border border-[#E4DFD3] dark:border-white/10 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#11241C] dark:text-white">
              Municipal Resolution Timeline
            </h4>

            <div className="space-y-4 relative pl-4 border-l-2 border-[#E4DFD3] dark:border-white/10 ml-2 pt-1">
              {timelineSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={idx} className="relative space-y-0.5">
                    <div
                      className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#14231D] flex items-center justify-center ${
                        step.done
                          ? 'bg-[#063B2C] dark:bg-emerald-500 text-white'
                          : 'bg-[#D2CEBE] dark:bg-gray-600 text-transparent'
                      }`}
                    >
                      {step.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${step.done ? 'text-[#11241C] dark:text-white' : 'text-[#8C9B93] dark:text-[#A2B3AA]'}`}>
                        {step.title}
                      </p>
                      <span className="text-[10px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">
                        {step.date}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Municipality Response if present */}
          {report.officialResponse && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Municipality Response
              </span>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                {report.officialResponse}
              </p>
            </div>
          )}

          {/* Privacy Statement */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#121E19] rounded-xl border border-[#E4DFD3] dark:border-white/5 text-[11px] text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
            🔒 <b>Privacy Notice:</b> Your report information is shared only with authorized systems or personnel responsible for handling the reported civic issue.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E4DFD3] dark:border-white/10 flex items-center gap-2.5 bg-[#FAF8F5] dark:bg-[#121E19]">
          <button
            type="button"
            id={`btn-upvote-report-${report.id}`}
            onClick={() => upvoteCivicReport(report.id)}
            className="flex-1 py-3 rounded-xl bg-white dark:bg-[#16241F] border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white hover:bg-[#F2EFE8] dark:hover:bg-[#1C2C24] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
            <span>Escalate Priority ({report.upvotes || 1})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-bold transition-colors text-center cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
