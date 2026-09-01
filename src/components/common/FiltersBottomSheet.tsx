import React from 'react';
import { X } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const FiltersBottomSheet: React.FC = () => {
  const { isFilterOpen, setIsFilterOpen } = useNav();
  const { workerFilters, setWorkerFilters } = useApp();

  if (!isFilterOpen) return null;

  const handleReset = () => {
    setWorkerFilters({
      category: 'All',
      distance: 'Any',
      availableNowOnly: false,
      availableTodayOnly: false,
      minRating: 4.0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl border-t border-[#E8E4DA] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Pill */}
        <div className="w-12 h-1.5 bg-[#D2CEBE] rounded-full mx-auto mb-4"></div>

        {/* Title & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE1]">
          <h2 className="text-xl font-bold text-[#11241C]">Filters</h2>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#55685F] hover:bg-[#F3F0E6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        <div className="space-y-6 py-4">
          {/* Distance */}
          <div>
            <label className="block text-sm font-bold text-[#11241C] mb-2.5">
              Distance
            </label>
            <div className="flex items-center gap-2.5">
              {(['Any', '< 2 km', '< 5 km'] as const).map((dist) => {
                const isSelected = workerFilters.distance === dist;
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setWorkerFilters((f) => ({ ...f, distance: dist }))}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#063B2C] text-white border-[#063B2C]'
                        : 'bg-white text-[#11241C] border-[#D2CEBE] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {dist}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-bold text-[#11241C] mb-3">
              Availability
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={workerFilters.availableNowOnly}
                  onChange={(e) => setWorkerFilters((f) => ({ ...f, availableNowOnly: e.target.checked }))}
                  className="w-5 h-5 rounded border-[#D2CEBE] text-[#063B2C] focus:ring-[#063B2C]"
                />
                <span className="text-sm font-medium text-[#11241C]">Available Now</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={workerFilters.availableTodayOnly}
                  onChange={(e) => setWorkerFilters((f) => ({ ...f, availableTodayOnly: e.target.checked }))}
                  className="w-5 h-5 rounded border-[#D2CEBE] text-[#063B2C] focus:ring-[#063B2C]"
                />
                <span className="text-sm font-medium text-[#11241C]">Available Today</span>
              </label>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-[#11241C]">Minimum Rating</label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#D4E8DC] text-[#063B2C]">
                {workerFilters.minRating.toFixed(1)}+
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.1"
              value={workerFilters.minRating}
              onChange={(e) => setWorkerFilters((f) => ({ ...f, minRating: parseFloat(e.target.value) }))}
              className="w-full accent-[#063B2C] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#6B7280] mt-1">
              <span>3.0 ★</span>
              <span>4.0 ★</span>
              <span>5.0 ★</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F0ECE1]">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3.5 px-4 rounded-xl border border-[#D2CEBE] font-bold text-sm text-[#11241C] hover:bg-[#FAF8F5] active:scale-98 transition-all cursor-pointer text-center"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            className="flex-1 py-3.5 px-4 rounded-xl bg-[#063B2C] font-bold text-sm text-white hover:bg-[#084D3A] active:scale-98 transition-all shadow-md cursor-pointer text-center"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
