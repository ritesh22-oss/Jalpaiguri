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
  PlusCircle
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { CivicReportStatus } from '../../types';

export const ReportTrackingView: React.FC = () => {
  const { goBack, navigate, activeParams } = useNav();
  const { civicReports, upvoteCivicReport, showToast } = useApp();

  const reportId = activeParams?.reportId || civicReports[0]?.id || 'JPG-84210';
  const report = civicReports.find((r) => r.id === reportId) || civicReports[0];

  const [hasUpvoted, setHasUpvoted] = useState(false);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] p-5 max-w-md mx-auto text-center pt-20 space-y-4">
        <p className="text-sm font-bold text-[#11241C] dark:text-white">No reports found.</p>
        <button
          onClick={() => navigate('report-problem')}
          className="px-4 py-2.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs cursor-pointer"
        >
          Submit a Report
        </button>
      </div>
    );
  }

  const steps = [
    {
      title: 'Report Logged',
      date: report.reportedAt || 'Today',
      done: true,
      desc: 'Logged and assigned to Jalpaiguri Municipal Ward officer'
    },
    {
      title: 'Assigned to Ward Inspector',
      date: report.status !== 'Submitted' ? 'Completed' : 'Within 2 hrs',
      done: report.status !== 'Submitted',
      desc: 'Sanitary / Engineering Inspector assigned for field verification'
    },
    {
      title: 'On-site Inspection',
      date: ['In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(report.status) ? 'In progress' : 'Pending',
      done: ['In Progress', 'Action Taken', 'Resolved', 'Closed'].includes(report.status),
      desc: 'Maintenance crew inspecting ground conditions'
    },
    {
      title: 'Work Resolved & Verified',
      date: report.status === 'Resolved' || report.status === 'Closed' ? 'Completed' : 'Expected 24-48 hrs',
      done: report.status === 'Resolved' || report.status === 'Closed',
      desc: 'Repair or clearance verified by Ward Council'
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Civic Report ${report.id}`,
        text: `Tracking ${report.category} issue at ${report.location}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText?.(`${report.id}: ${report.category} at ${report.location}`);
      showToast('Report reference copied to clipboard!', 'info');
    }
  };

  const handleUpvote = () => {
    if (!hasUpvoted) {
      upvoteCivicReport(report.id);
      setHasUpvoted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
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
      </header>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-[#16241F] rounded-3xl p-5 border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1 rounded-full">
              {report.status}
            </span>
            <span className="text-xs font-mono font-black text-[#55685F] dark:text-[#A2B3AA]">
              {report.id}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#11241C] dark:text-white">
                {report.category} Issue
              </h2>
              {report.severity && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                  {report.severity}
                </span>
              )}
            </div>

            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400 shrink-0" />
              <span>{report.location}</span>
            </p>
          </div>

          <div className="bg-[#FAF8F5] dark:bg-[#121E19] p-3.5 rounded-2xl text-xs text-[#55685F] dark:text-[#A2B3AA] border border-[#E8E4DA] dark:border-white/5 leading-relaxed font-medium">
            "{report.description}"
          </div>

          {report.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#E8E4DA] dark:border-white/10 max-h-52 bg-black/5 dark:bg-black/30">
              {report.mediaType === 'video' ? (
                <video src={report.photoUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={report.photoUrl} alt="Issue" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-[#F2EFE8] dark:border-white/5 text-[11px] text-[#8C9B93]">
            <span>Reported {report.reportedAt || 'Recently'}</span>
            <button
              type="button"
              onClick={handleUpvote}
              className="flex items-center gap-1.5 font-bold text-[#063B2C] dark:text-emerald-400 hover:underline cursor-pointer"
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
                    step.done ? 'bg-[#063B2C] dark:bg-emerald-500' : 'bg-[#D2CEBE] dark:bg-gray-600'
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
            <PlusCircle className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
            <span>Report Another Problem</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full py-3.5 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-[#084D3A] cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
