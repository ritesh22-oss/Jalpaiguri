import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Phone,
  MessageSquare,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Plus
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { Worker as AppWorker } from '../../types';

export const WorkersView: React.FC = () => {
  const { goBack, navigate, setIsFilterOpen } = useNav();
  const { workers, workerFilters, setWorkerFilters } = useApp();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'find' | 'offer'>('find');

  const categories = [
    'All',
    'Masi / Household Helper',
    'Maid / Domestic Helper',
    'Cook / Maharaj',
    'Elderly Care / Patient Attendant',
    'Electrician',
    'Plumber',
    'Carpenter',
    'Painter',
    'Cleaner',
    'AC Repair'
  ];

  // Apply filters
  const filteredWorkers = workers.filter((w) => {
    // category filter
    if (workerFilters.category !== 'All' && w.category !== workerFilters.category) {
      return false;
    }
    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchProf = w.profession.toLowerCase().includes(q);
      const matchSkills = w.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchProf && !matchSkills) return false;
    }
    // distance
    if (workerFilters.distance === '< 2 km') {
      const km = parseFloat(w.distance);
      if (km > 2.0) return false;
    } else if (workerFilters.distance === '< 5 km') {
      const km = parseFloat(w.distance);
      if (km > 5.0) return false;
    }
    // availability
    if (workerFilters.availableNowOnly && w.availability !== 'Available Now') {
      return false;
    }
    if (workerFilters.availableTodayOnly && w.availability !== 'Available Today' && w.availability !== 'Available Now') {
      return false;
    }
    // minRating
    if (w.rating < workerFilters.minRating) {
      return false;
    }
    return true;
  });

  const handleCall = (worker: AppWorker, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${worker.phone.replace(/\s+/g, '')}`;
  };

  const handleMessage = (worker: AppWorker, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('chat', { recipientId: worker.id, recipientName: worker.name, profession: worker.profession });
  };

  const handleRequest = (worker: AppWorker, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('worker-request', { workerId: worker.id });
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors">
      {/* Exact Header matching Screenshot 4 */}
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <h1 className="text-xl font-extrabold text-[#0B2A4A] dark:text-white tracking-tight">
            Local Workers
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('offer-services')}
            className="px-3 py-2 rounded-full bg-[#007AFF] dark:bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Add your work & profile"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Work</span>
          </button>
          <button
            onClick={() => {
              const input = document.getElementById('worker-search-input');
              input?.focus();
            }}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Search Bar + Filter Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs transition-colors">
            <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA]" />
            <input
              id="worker-search-input"
              type="text"
              placeholder="What service do you need?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] bg-transparent focus:outline-none"
            />
          </div>

          <button
            id="filter-trigger-btn"
            onClick={() => setIsFilterOpen(true)}
            className="w-12 h-12 bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer shrink-0"
            title="Open Filters"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {/* Category Pills (All, Electrician, Plumber, Carpenter) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = workerFilters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setWorkerFilters((prev) => ({ ...prev, category: cat }))}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#007AFF] dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white border border-[#D2CEBE] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Worker Cards List */}
        <div className="space-y-4 pt-1">
          {filteredWorkers.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title={workers.length === 0 ? "No Workers Registered Yet" : "No Match Found"}
              description={workers.length === 0 
                ? "Be the first verified professional to join the Jalpaiguri directory and help your community."
                : "Try adjusting your trade category or search filters to find what you're looking for."}
              actionLabel={workers.length === 0 ? "Join as Worker" : "Reset Filters"}
              onAction={() => {
                if (workers.length === 0) {
                  navigate('offer-services');
                } else {
                  setWorkerFilters({
                    category: 'All',
                    distance: 'Any',
                    availableNowOnly: false,
                    availableTodayOnly: false,
                    minRating: 3.0
                  });
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                onClick={() => navigate('worker-detail', { workerId: worker.id })}
                className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs hover:border-[#007AFF] dark:hover:border-blue-500 transition-all cursor-pointer space-y-3.5"
              >
                {/* Top Worker Profile Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={worker.avatarUrl}
                      alt={worker.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E8E4DA] dark:border-white/10 shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-base text-[#11241C] dark:text-white leading-tight">
                        {worker.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1 mt-0.5">
                        <span>{worker.profession}</span>
                        {worker.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400 fill-blue-50 dark:fill-blue-950/60" />
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-1 flex-wrap">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-[#007AFF] dark:text-blue-400" />
                          <span>{worker.distance}</span>
                        </span>
                        <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          worker.availability === 'Available Now'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            : worker.availability === 'Available Morning'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                            : worker.availability === 'Available Evening'
                            ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-300'
                            : worker.availability === 'Full Day'
                            ? 'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300'
                            : 'bg-teal-100 text-teal-900 dark:bg-teal-950/70 dark:text-teal-300'
                        }`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{worker.availability}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating pill */}
                  <div className="bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E2DED4] dark:border-white/10 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 fill-[#007AFF] dark:fill-blue-400 text-[#007AFF] dark:text-blue-400" />
                    <span className="text-xs font-extrabold text-[#11241C] dark:text-white">
                      {worker.rating}
                    </span>
                    <span className="text-[10px] text-[#73827B] dark:text-[#A2B3AA]">({worker.reviewCount})</span>
                  </div>
                </div>

                {/* Pricing row with startingPrice and monthlyRate */}
                <div className="flex items-center justify-between text-xs font-bold text-[#11241C] dark:text-white px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#007AFF] dark:text-blue-400">{worker.startingPrice}</span>
                    {worker.monthlyRate && (
                      <span className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-semibold bg-[#FAF8F5] dark:bg-white/5 px-2 py-0.5 rounded-md border border-[#E8E4DA] dark:border-white/10">
                        {worker.monthlyRate}
                      </span>
                    )}
                  </div>
                  {worker.completedJobs > 0 && (
                    <span className="text-[10px] text-[#73827B] dark:text-[#A2B3AA] font-normal">
                      {worker.completedJobs}+ jobs completed
                    </span>
                  )}
                </div>

                {/* 3 Action Buttons matching Screenshot 4: Call, Message, Request */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* Call Button (light blue) */}
                  <button
                    type="button"
                    onClick={(e) => handleCall(worker, e)}
                    className="py-2.5 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all cursor-pointer border border-transparent dark:border-blue-800/40"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>

                  {/* Message Button (light blue) */}
                  <button
                    type="button"
                    onClick={(e) => handleMessage(worker, e)}
                    className="py-2.5 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all cursor-pointer border border-transparent dark:border-blue-800/40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  {/* Request Button (dark blue #007AFF) */}
                  <button
                    type="button"
                    onClick={(e) => handleRequest(worker, e)}
                    className="py-2.5 px-3 rounded-2xl bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Request</span>
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Offer Services promotion card */}
        <div
          onClick={() => navigate('offer-services')}
          className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-[#13281E] dark:to-[#182C22] border border-blue-200 dark:border-blue-800/40 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-colors"
        >
          <div>
            <h4 className="font-extrabold text-sm text-[#007AFF] dark:text-blue-400">
              Are you a skilled professional?
            </h4>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
              Register your trade & get direct customer requests in Jalpaiguri.
            </p>
          </div>
          <button className="px-3.5 py-2 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white text-xs font-bold shrink-0">
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
