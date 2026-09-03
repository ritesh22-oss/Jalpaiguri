import React from 'react';
import {
  Hammer,
  Lightbulb,
  Trash2,
  Droplet,
  Waves,
  Zap,
  Droplets,
  AlertTriangle,
  Footprints,
  TrafficCone,
  DoorClosed,
  Trash,
  Trees,
  TreePine,
  PawPrint,
  HelpCircle,
  Check
} from 'lucide-react';
import { CivicCategory } from '../../types';

export interface CategoryOption {
  id: CivicCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'Road', label: 'Road & Potholes', icon: Hammer, description: 'Damaged roads, potholes, cracks' },
  { id: 'Streetlight', label: 'Streetlight', icon: Lightbulb, description: 'Broken, unlit or flickering lamps' },
  { id: 'Garbage', label: 'Garbage', icon: Trash2, description: 'Uncollected waste, overflowing bins' },
  { id: 'Water', label: 'Water Supply', icon: Droplet, description: 'Pipeline leaks, contaminated water' },
  { id: 'Flooding', label: 'Flooding / Waterlogging', icon: Waves, description: 'Submerged street, monsoon accumulation' },
  { id: 'Electricity', label: 'Electricity / Wire', icon: Zap, description: 'Loose dangling wire, transformer spark' },
  { id: 'Drainage', label: 'Drainage', icon: Droplets, description: 'Clogged roadside drains, stagnant water' },
  { id: 'Sewage', label: 'Sewage', icon: AlertTriangle, description: 'Open manhole, sewer overflow, bad odor' },
  { id: 'Footpath', label: 'Footpath', icon: Footprints, description: 'Broken pavement tiles, obstruction' },
  { id: 'Traffic Signal', label: 'Traffic Signal', icon: TrafficCone, description: 'Malfunctioning signal, missing sign' },
  { id: 'Public Toilet', label: 'Public Toilet', icon: DoorClosed, description: 'Unhygienic municipal public restroom' },
  { id: 'Illegal Dumping', label: 'Illegal Dumping', icon: Trash, description: 'Debris dumped in open field / riverbank' },
  { id: 'Park / Public Space', label: 'Park / Public Space', icon: Trees, description: 'Damaged park bench, broken fence' },
  { id: 'Tree / Fallen Tree', label: 'Tree / Fallen Tree', icon: TreePine, description: 'Blocked road branch, hazardous tree' },
  { id: 'Stray Animal', label: 'Stray Animal', icon: PawPrint, description: 'Aggressive stray pack, injured cattle' },
  { id: 'Other', label: 'Other Grievance', icon: HelpCircle, description: 'Other civic or municipal matter' },
];

interface ReportCategorySelectorProps {
  selectedCategory: CivicCategory;
  onSelectCategory: (category: CivicCategory) => void;
}

export const ReportCategorySelector: React.FC<ReportCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-[#11241C] dark:text-white flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">1</span>
          Select Category <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
          {CATEGORY_OPTIONS.length} categories
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CATEGORY_OPTIONS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComp = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              id={`cat-btn-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`group text-left px-3 py-2.5 rounded-2xl border transition-all duration-150 cursor-pointer relative flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-[#063B2C] dark:bg-emerald-600 text-white border-[#063B2C] dark:border-emerald-600 shadow-sm ring-2 ring-[#063B2C]/20 dark:ring-emerald-500/30'
                  : 'bg-white dark:bg-[#16241F] text-[#11241C] dark:text-white border-[#E4DFD3] dark:border-white/10 hover:border-[#063B2C]/40 dark:hover:border-emerald-500/40 hover:bg-[#FAF8F5] dark:hover:bg-[#1B2C24]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F2EFE8] dark:bg-[#121E19] text-[#063B2C] dark:text-emerald-400 group-hover:bg-[#E7E2D5] dark:group-hover:bg-[#172720]'
                }`}
              >
                <IconComp className="w-4 h-4 stroke-[2]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate leading-tight">
                  {cat.label}
                </p>
              </div>

              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-white text-[#063B2C] dark:text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
