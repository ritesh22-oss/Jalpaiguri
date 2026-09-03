import React, { useRef, useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Video,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Film
} from 'lucide-react';

interface ReportMediaUploaderProps {
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  onMediaSelected: (url: string | null, type: 'image' | 'video' | null) => void;
}

export const ReportMediaUploader: React.FC<ReportMediaUploaderProps> = ({
  mediaUrl,
  mediaType,
  onMediaSelected
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    setErrorMessage(null);

    // Max file size: 15MB
    const MAX_SIZE_MB = 15;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select media under ${MAX_SIZE_MB}MB.`);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      setErrorMessage('Unsupported file format. Please choose an image (JPG, PNG, WebP) or short video (MP4, MOV).');
      return;
    }

    setFileName(file.name);
    setUploadProgress(15);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percent);
      }
    };

    reader.onloadend = () => {
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        onMediaSelected(reader.result as string, isVideo ? 'video' : 'image');
      }, 300);
    };

    reader.onerror = () => {
      setUploadProgress(null);
      setErrorMessage('Failed to read media file. Please try another file.');
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMediaSelected(null, null);
    setFileName(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-[#11241C] dark:text-white flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">2</span>
          Photo or Video Evidence
          <span className="text-[11px] font-normal text-[#55685F] dark:text-[#A2B3AA] lowercase">(optional)</span>
        </label>
        {mediaUrl && (
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" /> Media attached
          </span>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Error state */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-bold">Media Upload Error</p>
            <p className="text-[11px] mt-0.5 opacity-90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploading progress state */}
      {uploadProgress !== null && (
        <div className="p-4 bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#11241C] dark:text-white">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#063B2C] dark:text-emerald-400" />
              Processing media...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E4DFD3] dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#063B2C] dark:bg-emerald-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Media preview state */}
      {mediaUrl && uploadProgress === null ? (
        <div className="bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl p-3 space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 max-h-56 flex items-center justify-center border border-black/5 dark:border-white/5">
            {mediaType === 'video' ? (
              <video
                src={mediaUrl}
                controls
                className="max-h-56 w-full rounded-xl object-contain bg-black"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Civic issue evidence"
                className="max-h-56 w-full object-cover rounded-xl"
              />
            )}

            <div className="absolute top-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              {mediaType === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              <span>{mediaType === 'video' ? 'Video Evidence' : 'Photo Evidence'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] truncate max-w-[180px]">
              {fileName || 'Attached evidence'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-replace-media"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl border border-[#D2CEBE] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1E3027] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-[#063B2C] dark:text-emerald-400" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                id="btn-remove-media"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : uploadProgress === null ? (
        /* Empty upload card */
        <div className="bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl p-4 transition-colors space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Take photo with camera */}
            <button
              type="button"
              id="btn-open-camera"
              onClick={() => cameraInputRef.current?.click()}
              className="py-3 px-3 rounded-xl border border-dashed border-[#B8B4A4] dark:border-white/20 bg-[#FAF8F5] dark:bg-[#121E19] hover:border-[#063B2C] dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-[#1A2A22] transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-[#1A2A22] text-[#063B2C] dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#11241C] dark:text-white">Take Photo</p>
                <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA]">Use device camera</p>
              </div>
            </button>

            {/* Upload from Gallery / Video */}
            <button
              type="button"
              id="btn-open-gallery"
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-3 rounded-xl border border-dashed border-[#B8B4A4] dark:border-white/20 bg-[#FAF8F5] dark:bg-[#121E19] hover:border-[#063B2C] dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-[#1A2A22] transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-[#1A2A22] text-[#063B2C] dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <ImageIcon className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#11241C] dark:text-white">Upload Media</p>
                <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA]">Gallery photo or video</p>
              </div>
            </button>
          </div>

          <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] text-center leading-relaxed">
            Photos help municipal ward inspectors locate and resolve the issue faster.
          </p>
        </div>
      ) : null}
    </div>
  );
};
