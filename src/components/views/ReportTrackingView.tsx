import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Building,
  UserCheck,
  ShieldAlert,
  ThumbsUp,
  Share2,
  Search,
  Wrench,
  Archive,
  Flame,
  PlusCircle,
  ChevronRight
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { CivicReportStatus } from '../../types';

export const ReportTrackingView: React.FC = () => {
  const { goBack, navigate, activeParams } = useNav();
  const { civicReports, upvoteCivicReport, showToast } = useApp();

  const reportId = activeParams?.reportId;
  const report = reportId ? (civicReports.find((r) => r.id === reportId) || civicReports[0]) : null;
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const activeReport = report || (selectedReportId ? civicReports.find(r => r.id === selectedReportId) : null);

  const [hasUpvoted, setHasUpvoted] = useState(false);

  if (!activeReport && civicReports.length > 0) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors">
        <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#16241F] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-[#11241C] dark:text-white">
                My Civic Reports
              </h1>
              <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                Track your reported municipal issues
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto p-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-3xl border border-blue-200 dark:border-blue-800/40 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">Municipal Tracking</h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 opacity-90 mt-0.5">
                Select a report below to view its real-time resolution status from the Jalpaiguri ward office.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {civicReports.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReportId(r.id)}
                className="bg-white dark:bg-[#16241F] p-4 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-xs hover:border-[#007AFF]/30 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-[#E6F4EA] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/30">
                      {r.id}
                    </span>
                    <h4 className="text-xs font-extrabold text-[#11241C] dark:text-white truncate">
                      {r.category}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] line-clamp-1">{r.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#8C9B93]">
                    <Clock className="w-3 h-3" />
                    <span>Reported on {r.reportedAt}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    r.status === 'Resolved' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {r.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#B8B4A4]" />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('report-problem')}
            className="w-full py-4 rounded-2xl bg-white dark:bg-[#16241F] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#007AFF]" />
            <span>Report New Problem</span>
          </button>
        </div>
      </div>
    );
  }

  if (!activeReport) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] p-5 max-w-md mx-auto text-center pt-20 space-y-4">
        <p className="text-sm font-bold text-[#11241C] dark:text-white">No reports found.</p>
        <button
          onClick={() => navigate('report-problem')}
          className="px-4 py-2.5 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs cursor-pointer"
        >
          Submit a Report
        </button>
      </div>
    );
  }

  const steps = [
    {
      title: 'Report Logged',
      date: activeReport.reportedAt || 'Today',
      done: true,
      desc: 'Logged and assigned to Jalpaiguri Municipal Ward officer'
    },
    {
      title: 'Assigned to Ward Inspector',
      date: activeReport.status !== 'Submitted' ? 'Completed' : 'Within 2 hrs',
      done: activeReport.status !== 'Submitted',
      desc: 'Sanitary / Engineering Inspector assigned for field verification'
    },
    {
      title: 'On-site Inspection',
      date: ['In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(activeReport.status) ? 'In progress' : 'Pending',
      done: ['In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(activeReport.status),
      desc: 'Maintenance crew inspecting ground conditions'
    },
    {
      title: 'Work Resolved & Verified',
      date: activeReport.status === 'Resolved' || activeReport.status === 'Closed' ? 'Completed' : 'Expected 24-48 hrs',
      done: activeReport.status === 'Resolved' || activeReport.status === 'Closed',
      desc: 'Repair or clearance verified by Ward Council'
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Civic Report ${activeReport.id}`,
        text: `Tracking ${activeReport.category} issue at ${activeReport.location}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText?.(`${activeReport.id}: ${activeReport.category} at ${activeReport.location}`);
      showToast('Report reference copied to clipboard!', 'info');
    }
  };

  const handleUpvote = () => {
    if (!hasUpvoted) {
      upvoteCivicReport(activeReport.id);
      setHasUpvoted(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors">
      {/* Header */}
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#16241F] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-[#11241C] dark:text-white">
              Civic Issue Status
            </h1>
            <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
              Official Jalpaiguri Municipal Log
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#16241F] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs"
        >
          <Share2 className="w-4 h-4" />
        </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 sm:p-5 space-y-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-[#16241F] rounded-3xl p-5 border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#007AFF] dark:text-blue-400 bg-[#E6F4EA] dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 px-3 py-1 rounded-full">
              {activeReport.status}
            </span>
            <span className="text-xs font-mono font-black text-[#55685F] dark:text-[#A2B3AA]">
              {activeReport.id}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#11241C] dark:text-white">
                {activeReport.category} Issue
              </h2>
              {activeReport.severity && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                  {activeReport.severity}
                </span>
              )}
            </div>

            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400 shrink-0" />
              <span>{activeReport.location}</span>
            </p>
          </div>

          <div className="bg-[#FAF8F5] dark:bg-[#121E19] p-3.5 rounded-2xl text-xs text-[#55685F] dark:text-[#A2B3AA] border border-[#E8E4DA] dark:border-white/5 leading-relaxed font-medium">
            "{activeReport.description}"
          </div>

          {activeReport.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#E8E4DA] dark:border-white/10 max-h-52 bg-black/5 dark:bg-black/30">
              {activeReport.mediaType === 'video' ? (
                <video src={activeReport.photoUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={activeReport.photoUrl} alt="Issue" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-[#F2EFE8] dark:border-white/5 text-[11px] text-[#8C9B93]">
            <span>Reported {activeReport.reportedAt || 'Recently'}</span>
            <button
              type="button"
              onClick={handleUpvote}
              className="flex items-center gap-1.5 font-bold text-[#007AFF] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Escalate ({report.upvotes || 1})</span>
            </button>
          </div>
        </div>

        {/* Resolution Timeline */}
        <div className="bg-white dark:bg-[#16241F] rounded-3xl p-5 border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-4 transition-colors">
          <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white uppercase tracking-wider">
            Resolution Progress
          </h3>

          <div className="space-y-4 relative pl-4 border-l-2 border-[#E8E4DA] dark:border-white/10 ml-2">
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-1">
                <div
                  className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#16241F] shadow-xs flex items-center justify-center ${
                    step.done ? 'bg-[#007AFF] dark:bg-blue-500' : 'bg-[#D2CEBE] dark:bg-gray-600'
                  }`}
                >
                  {step.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold ${step.done ? 'text-[#11241C] dark:text-white' : 'text-[#8C9B93] dark:text-[#A2B3AA]'}`}>
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">{step.date}</span>
                </div>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => navigate('report-problem')}
            className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#16241F] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs hover:bg-[#FAF8F5] dark:hover:bg-[#1C2C24] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#007AFF] dark:text-blue-400" />
            <span>Report Another Problem</span>
          </button>

          <button
            onClick={() => {
              if (selectedReportId) {
                setSelectedReportId(null);
              } else {
                navigate('home');
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 cursor-pointer"
          >
            {selectedReportId ? 'Back to All Reports' : 'Return to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};
