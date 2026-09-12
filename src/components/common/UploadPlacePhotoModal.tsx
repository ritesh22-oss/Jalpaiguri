import React, { useState } from 'react';
import { X, Upload, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadPlacePhotoModalProps {
  placeId: string;
  placeName: string;
  category?: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (photoUrl: string) => void;
}

export const UploadPlacePhotoModal: React.FC<UploadPlacePhotoModalProps> = ({
  placeName,
  isOpen,
  onClose,
  onUploaded
}) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      if (onUploaded) onUploaded(photoUrl.trim());
      setTimeout(() => {
        setSuccess(false);
        setPhotoUrl('');
        setContributorName('');
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-[#17231E] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Upload Landmark Photo</h3>
              <p className="text-xs text-gray-500 truncate max-w-[220px]">{placeName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Photo Submitted!</h4>
            <p className="text-xs text-gray-500">Thank you for contributing to the Jalpaiguri directory archive.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Image Web Link (Direct URL)
              </label>
              <input
                type="url"
                required
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/jalpaiguri-photo.jpg"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Your Name / Attribution (Optional)
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="e.g. Local Contributor"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl flex items-start gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Only submit high quality, authentic photos of landmarks and public spots located in Jalpaiguri.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !photoUrl}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isSubmitting ? 'Uploading...' : 'Submit Photo'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
