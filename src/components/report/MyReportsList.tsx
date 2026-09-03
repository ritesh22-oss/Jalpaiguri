import React, { useState, useMemo } from 'react';
import {
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  UserCheck,
  Wrench,
  Archive,
  AlertCircle,
  ThumbsUp,
  Tag,
  PlusCircle
} from 'lucide-react';
import { CivicReport, CivicReportStatus } from '../../types';
import { CATEGORY_OPTIONS } from './ReportCategorySelector';

interface MyReportsListProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onNewReport: () => void;
}

export const MyReportsList: React.FC<MyReportsListProps> = ({
  reports,
  onSelectReport,
  onNewReport
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Read locally submitted IDs if any
  const myIds = useMemo(() => {
    try {
      const stored = localStorage.getItem('jpg_my_report_ids');
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter
      if (filterTab === 'Active') {
        if (r.status === 'Resolved' || r.status === 'Closed') return false;
      } else if (filterTab === 'Resolved') {
        if (r.status !== 'Resolved' && r.status !== 'Closed') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCategory = r.category.toLowerCase().includes(q);
        const matchLocation = r.location.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchId = r.id.toLowerCase().includes(q);
        if (!matchCategory && !matchLocation && !matchDesc && !matchId) return false;
      }

      return true;
    });
  }, [reports, filterTab, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header controls & tabs */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8C9B93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, category, or ward location…"
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl text-xs font-medium text-[#11241C] dark:text-white placeholder:text-[#8C9B93] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] dark:bg-[#121E19] rounded-2xl border border-[#E4DFD3] dark:border-white/10">
          {(['All', 'Active', 'Resolved'] as const).map((tab) => {
            const isSelected = filterTab === tab;
            const count = reports.filter((r) => {
              if (tab === 'Active') return r.status !== 'Resolved' && r.status !== 'Closed';
              if (tab === 'Resolved') return r.status === 'Resolved' || r.status === 'Closed';
              return true;
            }).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-[#16241F] text-[#063B2C] dark:text-emerald-400 shadow-xs border border-[#E4DFD3]/60 dark:border-white/10'
                    : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-[#063B2C]/10 dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-400'
                    : 'bg-black/5 dark:bg-white/5 text-[#8C9B93]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-2.5">
        {filteredReports.map((report) => {
          const catMeta = CATEGORY_OPTIONS.find((c) => c.id === report.category);
          const CatIcon = catMeta?.icon || FileText;
          const isMySubmission = myIds.includes(report.id);

          const isResolved = report.status === 'Resolved' || report.status === 'Closed';
          const isInProgress = report.status === 'In Progress' || report.status === 'Action Taken';

          return (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="group bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl p-4 hover:border-[#063B2C]/30 dark:hover:border-emerald-500/30 hover:shadow-sm transition-all cursor-pointer space-y-3 relative"
            >
              {/* Card top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E4DFD3] dark:border-white/10 flex items-center justify-center text-[#063B2C] dark:text-emerald-400 shrink-0">
                    <CatIcon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-[#11241C] dark:text-white truncate">
                        {report.category}
                      </h4>
                      {isMySubmission && (
                        <span className="text-[9px] font-bold bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#063B2C] dark:text-emerald-400 px-1.5 py-0.2 rounded-md">
                          My Report
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#8C9B93] dark:text-[#A2B3AA]">
                      {report.id}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${
                    isResolved
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                      : isInProgress
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40'
                  }`}
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : isInProgress ? (
                    <Wrench className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span>{report.status}</span>
                </span>
              </div>

              {/* Description snippet */}
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] line-clamp-2 leading-relaxed">
                {report.description}
              </p>

              {/* Bottom location & time row */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F2EFE8] dark:border-white/5 text-[11px] text-[#8C9B93] dark:text-[#A2B3AA]">
                <div className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3 h-3 text-[#063B2C] dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{report.location}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span>{report.reportedAt || 'Recent'}</span>
                  <div className="flex items-center gap-1 text-[#063B2C] dark:text-emerald-400 font-bold">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{report.upvotes || 1}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#B8B4A4] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="py-12 px-4 text-center bg-white dark:bg-[#16241F] rounded-3xl border border-[#E4DFD3] dark:border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] text-[#063B2C] dark:text-emerald-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#11241C] dark:text-white">
                No reports found
              </h4>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1 max-w-[260px] mx-auto leading-relaxed">
                {searchQuery
                  ? 'No issues match your current search terms. Try searching another keyword.'
                  : 'Notice a pothole, broken light or sewage problem? Submit a report to Jalpaiguri Municipality.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNewReport}
              className="mt-2 px-4 py-2.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report a Problem</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
