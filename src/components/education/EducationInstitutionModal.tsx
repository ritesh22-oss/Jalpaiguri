import React, { useState, useEffect } from 'react';
import { EducationalInstitution } from '../../types';
import { X, MapPin, Phone, Globe, Award, BookOpen, Clock, ShieldCheck, ExternalLink, Camera } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';

interface EducationInstitutionModalProps {
  institution: EducationalInstitution | null;
  onClose: () => void;
}

export const EducationInstitutionModal: React.FC<EducationInstitutionModalProps> = ({
  institution,
  onClose
}) => {
  const { isBengali } = useLanguage();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [displayPhoto, setDisplayPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!institution) {
      setDisplayPhoto(null);
      return;
    }
    // Check if admin approved a custom thumbnail for this institution
    try {
      const customThumbs = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
      if (customThumbs[institution.id]) {
        setDisplayPhoto(customThumbs[institution.id]);
        return;
      }
    } catch {}

    if (institution.photos && institution.photos.length > 0) {
      setDisplayPhoto(institution.photos[0]);
    } else {
      setDisplayPhoto(null);
    }
  }, [institution]);

  if (!institution) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div 
          className="bg-white dark:bg-[#17231E] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Photo / Banner */}
          <div className="relative h-48 bg-gradient-to-r from-emerald-700 to-teal-800 rounded-t-3xl p-6 flex flex-col justify-end text-white overflow-hidden">
            {displayPhoto ? (
              <img 
                src={displayPhoto} 
                alt={institution.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-white/20"
                title="Upload photo from camera or gallery"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Photo</span>
              </button>
              <button 
                onClick={onClose}
                className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                {institution.category}
              </span>
              <h3 className="text-xl font-black leading-tight flex items-center gap-1.5">
                {isBengali && institution.nameBn ? institution.nameBn : institution.name}
                {institution.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 inline" />
                )}
              </h3>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {institution.locality}, Jalpaiguri
              </p>
            </div>
          </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          {institution.overview && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                {isBengali ? 'বিবরণ' : 'Overview'}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {institution.overview}
              </p>
            </div>
          )}

          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {institution.establishedYear && (
              <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                <span className="text-[11px] text-gray-500 block">{isBengali ? 'প্রতিষ্ঠা সাল' : 'Established'}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{institution.establishedYear}</span>
              </div>
            )}
            {institution.board && (
              <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                <span className="text-[11px] text-gray-500 block">{isBengali ? 'বোর্ড / অধিভুক্তি' : 'Board'}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{institution.board}</span>
              </div>
            )}
            {institution.classes && (
              <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                <span className="text-[11px] text-gray-500 block">{isBengali ? 'শ্রেণীসমূহ' : 'Classes'}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{institution.classes}</span>
              </div>
            )}
            {institution.medium && (
              <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                <span className="text-[11px] text-gray-500 block">{isBengali ? 'মাধ্যম' : 'Medium'}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{institution.medium}</span>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-2 border-t border-gray-100 dark:border-white/10 pt-4">
            {institution.phone && (
              <a 
                href={`tel:${institution.phone}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-sm hover:bg-blue-100 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                <span>{institution.phone}</span>
              </a>
            )}
            {institution.websiteUrl && (
              <a 
                href={institution.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{institution.websiteUrl.replace(/^https?:\/\//, '')}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
              </a>
            )}
          </div>

          {/* Facilities */}
          {institution.facilities && institution.facilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
                {isBengali ? 'সুযোগ সুবিধা' : 'Facilities'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {institution.facilities.map((fac, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Courses List */}
          {institution.courses && institution.courses.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                {isBengali ? 'পাঠ্যক্রম ও কোর্স' : 'Offered Courses'}
              </h4>
              <div className="space-y-2">
                {institution.courses.map((course) => (
                  <div 
                    key={course.id}
                    className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex justify-between items-center"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">{course.name}</h5>
                      <p className="text-xs text-gray-500">{course.duration}</p>
                    </div>
                    {course.fees && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {course.fees}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <UploadPlacePhotoModal
      placeId={institution.id}
      placeName={institution.name}
      category={`Education - ${institution.category}`}
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      onUploaded={(url) => setDisplayPhoto(url)}
    />
  </>
  );
};
