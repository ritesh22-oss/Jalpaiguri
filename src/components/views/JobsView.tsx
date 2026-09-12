import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Briefcase,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  Phone,
  Send,
  Camera
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';
import { getAdminPlaceThumbnails } from '../../utils/placesPhotoClient';

export const JobsView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { jobs } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [uploadEntity, setUploadEntity] = useState<any | null>(null);

  const handleApply = (id: string, title: string) => {
    setAppliedJobIds((prev) => [...prev, id]);
    alert(`Application sent for ${title}! The employer will reach out to you.`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors">
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
            Local Jobs
          </h1>
        </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['All', 'Full-time', 'Part-time', 'Contract'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                filterType === t
                  ? 'bg-[#007AFF] dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          {jobs.filter((j) => filterType === 'All' || (j.jobType || j.type) === filterType).length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={jobs.length === 0 ? "No Jobs Posted Yet" : "No Match Found"}
              description={jobs.length === 0 
                ? "There are currently no active job openings listed in Jalpaiguri. Check back soon!"
                : "Try changing your job type filter to see more opportunities."}
              actionLabel={jobs.length === 0 ? undefined : "Clear Filters"}
              onAction={() => setFilterType('All')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {jobs
                .filter((j) => filterType === 'All' || (j.jobType || j.type) === filterType)
                .map((job) => {
                const isApplied = appliedJobIds.includes(job.id);
                const jobKind = job.jobType || job.type || 'Full-time';
                const companyName = job.employer || job.company || 'Local Employer';
                const postDate = job.postedTime || job.postedAt || 'Recently';
                const approvedThumbs = getAdminPlaceThumbnails(job.id);

                return (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">{job.title}</h3>
                          <p className="text-xs font-semibold text-[#007AFF] dark:text-blue-400 mt-0.5">{companyName}</p>
                        </div>
                        <span className="text-[11px] font-bold text-[#854D0E] dark:text-amber-300 bg-[#FEF9C3] dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-transparent dark:border-amber-800/40">
                          {jobKind}
                        </span>
                      </div>

                      {/* Job / Workplace Approved Images Gallery */}
                      {approvedThumbs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">Workplace / Job Images</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {approvedThumbs.map((url, uidx) => (
                              <img
                                key={uidx}
                                src={url}
                                alt="Job site"
                                className="w-full h-12 rounded-xl object-cover border border-[#E8E4DA] dark:border-white/10"
                                referrerPolicy="no-referrer"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
                          <span>{job.location}</span>
                        </span>
                        <span>•</span>
                        <span className="text-[#11241C] dark:text-white font-extrabold">{job.salary}</span>
                      </div>

                      <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex justify-start">
                        <button
                          onClick={() => setUploadEntity(job)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-[#007AFF] dark:text-gray-400 dark:hover:text-[#38BDF8] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all bg-gray-50 dark:bg-white/5 active:scale-95"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Contribute Photo</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0ECE1] dark:border-white/10">
                      <span className="text-[10px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">Posted {postDate}</span>
                      <button
                        disabled={isApplied}
                        onClick={() => handleApply(job.id, job.title)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isApplied
                            ? 'bg-[#E6F4EA] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 border border-transparent dark:border-blue-800/40'
                            : 'bg-[#007AFF] dark:bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                        }`}
                      >
                        {isApplied ? 'Applied ✓' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {uploadEntity && (
        <UploadPlacePhotoModal
          placeId={uploadEntity.id}
          placeName={uploadEntity.title}
          category="Jobs"
          isOpen={!!uploadEntity}
          onClose={() => setUploadEntity(null)}
        />
      )}
    </div>
  );
};
