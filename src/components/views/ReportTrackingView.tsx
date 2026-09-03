import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Building,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const ReportTrackingView: React.FC = () => {
  const { goBack, navigate, activeParams } = useNav();
  const { civicReports } = useApp();

  const reportId = activeParams?.reportId || 'REP-2023-8841';
  const report = civicReports.find((r) => r.id === reportId) || civicReports[0];

  const steps = [
    { label: 'Report Logged', date: report?.reportedAt || report?.date || 'Today', done: true, desc: 'Logged with Jalpaiguri Municipal System' },
    { label: 'Assigned to Ward Officer', date: 'Within 2 hrs', done: report?.status !== 'Submitted', desc: 'Ward 12 Sanitary Inspector notified' },
    { label: 'On-site Inspection', date: 'In progress', done: report?.status === 'Action Taken' || report?.status === 'Resolved', desc: 'Field team reviewing the location' },
    { label: 'Work Resolved', date: 'Expected 24-48 hrs', done: report?.status === 'Resolved', desc: 'Issue repaired & verified' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#11241C] dark:text-white">Civic Issue Status</h1>
      </header>

      <div className="p-5 space-y-5">
        {/* Status Card */}
        <div className="bg-white dark:bg-[#17231E] rounded-3xl p-5 border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-3 py-1 rounded-full">
              {report?.status || 'In Progress'}
            </span>
            <span className="text-xs font-extrabold text-[#55685F] dark:text-[#A2B3AA]">
              ID: {report?.id}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[#11241C] dark:text-white">
              {report?.category} Issue
            </h2>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
              <span>{report?.location}</span>
            </p>
          </div>

          <div className="bg-[#FAF8F5] dark:bg-[#121E19] p-3 rounded-2xl text-xs text-[#55685F] dark:text-[#A2B3AA] border border-[#E8E4DA] dark:border-white/10">
            "{report?.description}"
          </div>

          {report?.photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-[#E8E4DA] dark:border-white/10 max-h-48">
              <img src={report.photoUrl} alt="Issue" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Timeline Steps */}
        <div className="bg-white dark:bg-[#17231E] rounded-3xl p-5 border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-4 transition-colors">
          <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white uppercase tracking-wider">
            Resolution Progress
          </h3>

          <div className="space-y-4 relative pl-4 border-l-2 border-[#E8E4DA] dark:border-white/10 ml-2">
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-1">
                <div
                  className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#17231E] shadow-xs ${
                    step.done ? 'bg-[#063B2C] dark:bg-emerald-500' : 'bg-[#D2CEBE] dark:bg-gray-600'
                  }`}
                ></div>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold ${step.done ? 'text-[#11241C] dark:text-white' : 'text-[#8C9B93] dark:text-[#A2B3AA]'}`}>
                    {step.label}
                  </h4>
                  <span className="text-[10px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">{step.date}</span>
                </div>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('home')}
          className="w-full py-3.5 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-[#084D3A] cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
