import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  Trash2,
  Zap,
  Lightbulb,
  Droplet,
  Waves,
  Hammer,
  Image as ImageIcon
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const ReportProblemView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { submitCivicReport } = useApp();
  const { user } = useAuth();

  const [category, setCategory] = useState<'Road' | 'Streetlight' | 'Garbage' | 'Water' | 'Flooding' | 'Electricity'>('Road');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState(user?.location || 'Jalpaiguri, WB (Auto-detected)');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Array<{ id: 'Road' | 'Streetlight' | 'Garbage' | 'Water' | 'Flooding' | 'Electricity'; label: string; icon: React.ReactNode }> = [
    { id: 'Road', label: 'Road', icon: <Hammer className="w-4 h-4" /> },
    { id: 'Streetlight', label: 'Streetlight', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'Garbage', label: 'Garbage', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'Water', label: 'Water', icon: <Droplet className="w-4 h-4" /> },
    { id: 'Flooding', label: 'Flooding', icon: <Waves className="w-4 h-4" /> },
    { id: 'Electricity', label: 'Electricity', icon: <Zap className="w-4 h-4" /> }
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a brief description of the issue');
      return;
    }
    setIsSubmitting(true);
    try {
      const report = await submitCivicReport({
        category,
        location,
        description,
        photoUrl: photoPreview || undefined
      });
      setSubmittedReportId(report.id);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-6 flex flex-col justify-between max-w-md mx-auto select-none">
        <div className="pt-12 text-center space-y-4">
          <div className="w-20 h-20 bg-[#E6F4EA] text-[#063B2C] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
            Report Submitted Successfully!
          </h2>
          <div className="inline-block bg-white px-4 py-2 rounded-xl border border-[#D2CEBE] text-sm font-bold text-[#063B2C]">
            Report ID: {submittedReportId}
          </div>
          <p className="text-sm text-[#55685F] leading-relaxed max-w-[280px] mx-auto">
            Your report has been logged and assigned to Jalpaiguri Municipal Ward officers for inspection.
          </p>
        </div>

        <div className="space-y-3 pb-6">
          <button
            onClick={() => navigate('report-tracking', { reportId: submittedReportId })}
            className="w-full py-4 rounded-2xl bg-[#063B2C] text-white font-bold text-sm shadow-md hover:bg-[#084D3A] cursor-pointer"
          >
            Track Status
          </button>
          <button
            onClick={goBack}
            className="w-full py-3.5 rounded-2xl bg-white border border-[#D2CEBE] text-[#11241C] font-bold text-sm hover:bg-[#FAF8F5] cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      {/* Exact Header matching Screenshot */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-lg font-bold text-[#11241C] tracking-tight">
          Report Problem
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="p-5 space-y-6">
        {/* Big Heading */}
        <div className="text-center pt-1 pb-2">
          <h2 className="text-3xl font-extrabold text-[#063B2C] tracking-tight">
            What needs fixing?
          </h2>
          <p className="text-sm text-[#55685F] mt-1.5 leading-relaxed">
            Help us improve Jalpaiguri by reporting local civic issues.
          </p>
        </div>

        {/* 1. Select Category */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#11241C]">
            1. Select Category
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2.5 py-3 px-4 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#063B2C] text-white border-[#063B2C] shadow-xs'
                      : 'bg-white text-[#11241C] border-[#D2CEBE] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-[#063B2C]'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Add a Photo */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#11241C]">
            2. Add a Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-[#B8B4A4] rounded-3xl bg-white flex flex-col items-center justify-center p-4 hover:border-[#063B2C] hover:bg-[#FAF8F5] transition-all cursor-pointer relative overflow-hidden"
          >
            {photoPreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Issue Preview"
                  className="max-h-full max-w-full rounded-2xl object-cover"
                />
                <span className="absolute bottom-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md">
                  Tap to change
                </span>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#11241C] flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-xs font-semibold text-[#55685F] block">
                  Tap to upload
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Location */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#11241C]">
            3. Location
          </label>
          <div className="w-full bg-white border border-[#D2CEBE] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className="w-5 h-5 text-[#063B2C] shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="font-bold text-xs sm:text-sm text-[#11241C] bg-transparent focus:outline-none truncate w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const manual = prompt('Enter exact area or ward in Jalpaiguri:', location);
                if (manual) setLocation(manual);
              }}
              className="text-xs font-extrabold text-[#063B2C] uppercase tracking-wider pl-2 hover:underline cursor-pointer"
            >
              EDIT
            </button>
          </div>
        </div>

        {/* 4. Description */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#11241C]">
            4. Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about the issue..."
            className="w-full bg-white border border-[#D2CEBE] rounded-2xl p-4 text-sm font-medium text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none focus:border-[#063B2C] shadow-xs resize-none"
          ></textarea>
        </div>

        {/* Submit Report Button matching screenshot */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#063B2C] text-white font-bold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 fill-white rotate-45" />
            <span>{isSubmitting ? 'Submitting Report…' : 'Submit Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
