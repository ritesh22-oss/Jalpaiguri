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
    if (selectedSpecialty !== 'All' && doc.specialty !== selectedSpecialty) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return doc.name.toLowerCase().includes(q) || doc.specialty.toLowerCase().includes(q) || doc.clinic.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#11241C] tracking-tight">
            Doctors & Health
          </h1>
        </div>
        <button
          onClick={() => navigate('emergency')}
          className="px-3 py-1.5 rounded-full bg-[#FFEBEA] text-[#D9383A] text-xs font-extrabold flex items-center gap-1 cursor-pointer"
        >
          <Ambulance className="w-3.5 h-3.5" />
          <span>Emergency</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="bg-white border border-[#D2CEBE] rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs">
          <Search className="w-4 h-4 text-[#55685F]" />
          <input
            type="text"
            placeholder="Search doctors, clinics, or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none"
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
                  ? 'bg-[#063B2C] text-white shadow-xs'
                  : 'bg-white border border-[#D2CEBE] text-[#11241C] hover:bg-[#FAF8F5]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* 24x7 Emergency Notice */}
        <div className="bg-[#EBF2FC] border border-[#C5DCFA] rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PlusSquare className="w-5 h-5 text-[#0A58CA]" />
            <div>
              <h4 className="text-xs font-bold text-[#0A58CA]">Jalpaiguri District Hospital</h4>
              <p className="text-[11px] text-[#42648B]">24/7 Casualty & Blood Bank open</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:03561224001'}
            className="px-3 py-1.5 rounded-xl bg-[#0A58CA] text-white font-bold text-xs"
          >
            Call
          </button>
        </div>

        {/* Doctor List */}
        <div className="space-y-3 pt-1">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#E8E4DA] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#11241C] truncate">{doc.name}</h3>
                    <span className="text-[11px] font-bold text-[#063B2C] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                      ★ {doc.rating}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#063B2C]">{doc.specialty} • {doc.experience}</p>
                  <p className="text-[11px] text-[#55685F] mt-0.5">{doc.clinic} ({doc.distance})</p>
                  <p className="text-[11px] font-bold text-[#11241C] mt-1">{doc.fee} • Timing: {doc.timing}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0ECE1]">
                <button
                  onClick={() => window.location.href = `tel:${doc.phone.replace(/\s+/g, '')}`}
                  className="py-2.5 rounded-xl bg-[#D2EBE0] text-[#063B2C] font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Clinic</span>
                </button>
                <button
                  onClick={() => alert(`Appointment request submitted for ${doc.name}. Clinic coordinator will confirm via SMS.`)}
                  className="py-2.5 rounded-xl bg-[#063B2C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
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
