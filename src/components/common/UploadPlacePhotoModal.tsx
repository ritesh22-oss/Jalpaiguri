import React, { useState, useRef } from 'react';
import { X, Upload, Camera, CheckCircle2, Image as ImageIcon, Sparkles, AlertCircle, Link } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface UploadPlacePhotoModalProps {
  placeId: string;
  placeName: string;
  category?: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (photoUrl: string) => void;
}

export const UploadPlacePhotoModal: React.FC<UploadPlacePhotoModalProps> = ({
  placeId,
  placeName,
  category = 'General',
  isOpen,
  onClose,
  onUploaded
}) => {
  const { submitPlacePhoto } = useApp();
  const { user, firebaseUser } = useAuth();

  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [photoUrl, setPhotoUrl] = useState('');
  const [contributorName, setContributorName] = useState(user?.name || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process selected image file into a base64 Data URL (standard client-side processing)
  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Limit to ~6MB max before downscaling
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size is too large. Please select a photo under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Compress/resize slightly via canvas for optimal storage & thumbnail display
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPreviewImage(compressedDataUrl);
            setPhotoUrl(compressedDataUrl);
          } else {
            setPreviewImage(result);
            setPhotoUrl(result);
          }
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = photoUrl.trim();
    if (!finalUrl) {
      setUploadError('Please choose a photo or provide an image link.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const uploaderName = contributorName.trim() || user?.name || 'Jalpaiguri Citizen';
      const uploaderEmail = firebaseUser?.email || user?.email || 'citizen@jalpaiguri.local';

      await submitPlacePhoto({
        placeId,
        placeName,
        category,
        imageUrl: finalUrl,
        uploaderName,
        uploaderEmail
      });

      setSuccess(true);
      if (onUploaded) onUploaded(finalUrl);

      setTimeout(() => {
        setSuccess(false);
        setPhotoUrl('');
        setPreviewImage(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to submit photo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#17231E] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">Contribute Place Photo</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px] font-semibold">{placeName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
            <h4 className="text-base font-extrabold text-gray-900 dark:text-white">Photo Sent to Admin Review!</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
              Your photo for <strong>{placeName}</strong> has been uploaded. Once the municipal administrator reviews and approves it, it will be set as the official place thumbnail.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tab Selector: Direct File (Gallery/Camera) vs URL */}
            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'upload'
                    ? 'bg-white dark:bg-[#1E2E28] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Gallery & Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'url'
                    ? 'bg-white dark:bg-[#1E2E28] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Web Link</span>
              </button>
            </div>

            {/* Hidden native input files */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload / Camera UI */}
            {activeMode === 'upload' ? (
              <div className="space-y-3">
                {previewImage ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/40 aspect-video bg-black/5 flex items-center justify-center group">
                    <img 
                      src={previewImage} 
                      alt="Upload Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/90 dark:bg-black/80 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-lg"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setPhotoUrl('');
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50/50 dark:bg-white/5 transition-all duration-300 hover:bg-blue-50/30 active:scale-98 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Choose from Gallery</span>
                      <span className="text-[10px] text-gray-500">JPG, PNG, WebP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50/50 dark:bg-white/5 transition-all duration-300 hover:bg-blue-50/30 active:scale-98 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Take a Photo</span>
                      <span className="text-[10px] text-gray-500">Use Device Camera</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Direct Web Image Link (URL)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  placeholder="https://example.com/jalpaiguri-landmark.jpg"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white"
                />
                {photoUrl && (
                  <div className="mt-2.5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-black/5 flex items-center justify-center">
                    <img 
                      src={photoUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={() => setUploadError('Could not load image from this URL. Please check the link.')}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Contributor Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Your Name / Photo Credit (Optional)
              </label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="e.g. Ramesh Roy"
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
              />
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Admin Notice */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-2xl flex items-start gap-2.5 text-blue-800 dark:text-blue-300 text-xs border border-blue-200/50 dark:border-blue-800/30">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>
                Photos are moderated in the <strong>Municipal Admin Panel</strong>. Once reviewed by the administrator (<code>riteshganguly0911@gmail.com</code>), the selected best photo becomes the primary place thumbnail.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !photoUrl}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all duration-300 active:scale-98 shadow-md cursor-pointer"
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
