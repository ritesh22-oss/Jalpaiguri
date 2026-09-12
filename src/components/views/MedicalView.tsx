import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Stethoscope,
  Phone,
  Calendar,
  Clock,
  MapPin,
  PlusSquare,
  ShieldCheck,
  Star,
  Pill,
  Ambulance,
  Camera
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { Doctor } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';
import { getAdminPlaceThumbnails } from '../../utils/placesPhotoClient';

export const MedicalView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { doctors } = useApp();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [search, setSearch] = useState('');
  const [uploadEntity, setUploadEntity] = useState<any | null>(null);

  const specialties = ['All', 'Cardiologist', 'Pediatrician', 'Orthopedic', 'General Physician', 'Gynecologist'];

  const filteredDoctors = doctors.filter((doc) => {
    const clinicName = doc.clinic || doc.medicalCentre || '';
    if (selectedSpecialty !== 'All' && doc.specialty !== selectedSpecialty) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return doc.name.toLowerCase().includes(q) || doc.specialty.toLowerCase().includes(q) || clinicName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors">
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
            Doctors & Health
          </h1>
        </div>
        <button
          onClick={() => navigate('emergency')}
          className="px-3 py-1.5 rounded-full bg-[#FFEBEA] dark:bg-red-950/50 text-[#D9383A] dark:text-red-400 text-xs font-extrabold flex items-center gap-1 cursor-pointer border border-transparent dark:border-red-900/40"
        >
          <Ambulance className="w-3.5 h-3.5" />
          <span>Emergency</span>
        </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs transition-colors">
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA]" />
          <input
            type="text"
            placeholder="Search doctors, clinics, or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#73857C] focus:outline-none bg-transparent"
          />
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedSpecialty === spec
                  ? 'bg-[#007AFF] dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* 24x7 Emergency Notice */}
        <div className="bg-[#EBF2FC] dark:bg-[#0D2137] border border-[#C5DCFA] dark:border-blue-900/50 rounded-2xl p-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <PlusSquare className="w-5 h-5 text-[#0056b3] dark:text-sky-300" />
            <div>
              <h4 className="text-xs font-bold text-[#0056b3] dark:text-sky-300">Jalpaiguri District Hospital</h4>
              <p className="text-[11px] text-[#42648B] dark:text-sky-200/80">24/7 Casualty & Blood Bank open</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:03561224001'}
            className="px-3 py-1.5 rounded-xl bg-[#0056b3] dark:bg-sky-600 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Call
          </button>
        </div>

        {/* Doctor List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {filteredDoctors.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title={doctors.length === 0 ? "No Doctors Listed Yet" : "No Match Found"}
              description={doctors.length === 0 
                ? "The medical directory is currently empty. Verified doctors in Jalpaiguri will be listed here soon."
                : "No doctors found matching your search or specialty filter. Try adjusting your criteria."}
              actionLabel={doctors.length === 0 ? undefined : "Clear Filters"}
              onAction={() => {
                setSelectedSpecialty('All');
                setSearch('');
              }}
            />
          ) : (
            filteredDoctors.map((doc) => {
              const approvedThumbs = getAdminPlaceThumbnails(doc.id);
              const activeAvatar = approvedThumbs.length > 0 ? approvedThumbs[0] : (doc.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80');

              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={activeAvatar}
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#E8E4DA] dark:border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white truncate">{doc.name}</h3>
                          <span className="text-[11px] font-bold text-[#007AFF] dark:text-[#38BDF8] bg-[#E6F4EA] dark:bg-[#1C4532] px-2 py-0.5 rounded-full">
                            ★ {doc.rating}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#007AFF] dark:text-[#38BDF8]">{doc.specialty} • {doc.experience || '10+ yrs exp'}</p>
                        <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-0.5">{doc.clinic || doc.medicalCentre} ({doc.distance})</p>
                        <p className="text-[11px] font-bold text-[#11241C] dark:text-white mt-1">{doc.fee || '₹400-₹600'} • Timing: {doc.timing || doc.visitingHours}</p>
                      </div>
                    </div>

                    {/* Approved Community Gallery */}
                    {approvedThumbs.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">Verified Photos ({approvedThumbs.length})</span>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                          {approvedThumbs.map((url, uidx) => (
                            <img
                              key={uidx}
                              src={url}
                              alt="curated thumb"
                              className="w-12 h-12 rounded-xl object-cover border border-[#E8E4DA] dark:border-white/10 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-start">
                      <button
                        onClick={() => setUploadEntity(doc)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-[#007AFF] dark:text-gray-400 dark:hover:text-[#38BDF8] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 bg-gray-50 dark:bg-white/5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Contribute Photo</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0ECE1] dark:border-white/10">
                    <button
                      onClick={() => window.location.href = `tel:${doc.phone.replace(/\s+/g, '')}`}
                      className="py-2.5 rounded-xl bg-[#D2EBE0] dark:bg-[#1C4532] text-[#007AFF] dark:text-[#38BDF8] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Clinic</span>
                    </button>
                    <button
                      onClick={() => alert(`Appointment request submitted for ${doc.name}. Clinic coordinator will confirm via SMS.`)}
                      className="py-2.5 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {uploadEntity && (
        <UploadPlacePhotoModal
          placeId={uploadEntity.id}
          placeName={uploadEntity.name}
          category="Medical"
          isOpen={!!uploadEntity}
          onClose={() => setUploadEntity(null)}
        />
      )}
    </div>
  );
};
