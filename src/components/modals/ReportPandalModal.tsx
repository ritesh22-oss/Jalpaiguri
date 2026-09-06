import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { DurgaPandalItem, PandalReport } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ReportPandalModalProps {
  pandal: DurgaPandalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<PandalReport, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

export const ReportPandalModal: React.FC<ReportPandalModalProps> = ({
  pandal,
  isOpen,
  onClose,
  onSubmitReport
}) => {
  const { isBengali } = useLanguage();
  const [issueType, setIssueType] = useState<PandalReport['issueType']>('wrong_location');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !pandal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert(isBengali ? 'অনুগ্রহ করে কি ভুল তা সংক্ষেপে লিখুন।' : 'Please describe the issue in detail.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReport({
        pandalId: pandal.id,
        pandalName: pandal.name,
        issueType,
        description: description.trim()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <AlertTriangle className="w-4 h-4 text-red-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                {isBengali ? 'ভুল বা তথ্য সংশোধন রিপোর্ট' : 'Report Listing Issue'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-red-100 truncate">
                {pandal.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'সমস্যার ধরণ (Issue Category) *' : 'Issue Category *'}
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="wrong_location">Wrong Location / GPS Pin Error (ভুল গুগল ম্যাপস অবস্থান)</option>
              <option value="outdated_info">Outdated Timings or Theme Info (পুরনো তথ্য বা ভুল সময়)</option>
              <option value="incorrect_photo">Incorrect Photo / Unrelated Image (ভুল বা অসঙ্গতিপূর্ণ ছবি)</option>
              <option value="duplicate">Duplicate Listing (নকল মণ্ডপ অ্যান্টি-এন্ট্রি)</option>
              <option value="other">Other Issue (অন্যান্য সমস্যা)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'সঠিক তথ্যের বিস্তারিত বিবরণ *' : 'Description of Correct Details *'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={isBengali ? 'সঠিক অবস্থান বা তথ্য লিখুন যা আমাদের ভেরিফিকেশন টিম সংশোধন করবে...' : 'Please describe the correction so our team can update it...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isBengali ? 'পাঠানো হচ্ছে...' : 'Submitting...'}</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'রিপোর্ট পাঠান' : 'Submit Report'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
