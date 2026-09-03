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
  Ambulance
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { Doctor } from '../../types';

export const MedicalView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { doctors } = useApp();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [search, setSearch] = useState('');

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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
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
      </header>

      <div className="p-4 space-y-4">
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
                  ? 'bg-[#063B2C] dark:bg-emerald-600 text-white shadow-xs'
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
            <PlusSquare className="w-5 h-5 text-[#0A58CA] dark:text-sky-300" />
            <div>
              <h4 className="text-xs font-bold text-[#0A58CA] dark:text-sky-300">Jalpaiguri District Hospital</h4>
              <p className="text-[11px] text-[#42648B] dark:text-sky-200/80">24/7 Casualty & Blood Bank open</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:03561224001'}
            className="px-3 py-1.5 rounded-xl bg-[#0A58CA] dark:bg-sky-600 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Call
          </button>
        </div>

        {/* Doctor List */}
        <div className="space-y-3 pt-1">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={doc.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#E8E4DA] dark:border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white truncate">{doc.name}</h3>
                    <span className="text-[11px] font-bold text-[#063B2C] dark:text-[#4ECCA3] bg-[#E6F4EA] dark:bg-[#1C4532] px-2 py-0.5 rounded-full">
                      ★ {doc.rating}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#063B2C] dark:text-[#4ECCA3]">{doc.specialty} • {doc.experience || '10+ yrs exp'}</p>
                  <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-0.5">{doc.clinic || doc.medicalCentre} ({doc.distance})</p>
                  <p className="text-[11px] font-bold text-[#11241C] dark:text-white mt-1">{doc.fee || '₹400-₹600'} • Timing: {doc.timing || doc.visitingHours}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0ECE1] dark:border-white/10">
                <button
                  onClick={() => window.location.href = `tel:${doc.phone.replace(/\s+/g, '')}`}
                  className="py-2.5 rounded-xl bg-[#D2EBE0] dark:bg-[#1C4532] text-[#063B2C] dark:text-[#4ECCA3] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Clinic</span>
                </button>
                <button
                  onClick={() => alert(`Appointment request submitted for ${doc.name}. Clinic coordinator will confirm via SMS.`)}
                  className="py-2.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
