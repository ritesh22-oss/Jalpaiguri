import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  CheckCircle2,
  Phone,
  MessageSquare,
  Wrench,
  ShieldCheck,
  Calendar,
  Share2,
  Clock,
  Heart
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const WorkerDetailView: React.FC = () => {
  const { goBack, navigate, activeParams } = useNav();
  const { workers, toggleSaveItem, savedItemIds } = useApp();

  const workerId = activeParams?.workerId || 'w-1';
  const worker = workers.find((w) => w.id === workerId) || workers[0];
  const isSaved = savedItemIds.includes(worker.id);

  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  const handleCall = () => {
    window.location.href = `tel:${worker.phone.replace(/\s+/g, '')}`;
  };

  const handleChat = () => {
    navigate('chat', { recipientId: worker.id, recipientName: worker.name, profession: worker.profession });
  };

  const handleRequest = () => {
    navigate('worker-request', { workerId: worker.id });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#11241C]">Provider Profile</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaveItem(worker.id)}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#D9383A] text-[#D9383A]' : 'text-[#11241C]'}`} />
          </button>
        </div>
      </header>

      <div className="p-5 space-y-5">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs space-y-4 text-center">
          <div className="relative inline-block mx-auto">
            <img
              src={worker.avatarUrl}
              alt={worker.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-[#063B2C] shadow-sm"
            />
            {worker.verified && (
              <span className="absolute -bottom-1.5 -right-1.5 bg-[#063B2C] text-white p-1 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#11241C] tracking-tight">
              {worker.name}
            </h2>
            <p className="text-xs font-bold text-[#063B2C] mt-0.5">
              {worker.profession} • {worker.experience || (worker.experienceYears ? `${worker.experienceYears} yrs exp` : 'Verified Professional')}
            </p>
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-[#55685F] mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                <span>{worker.location || worker.serviceArea} ({worker.distance})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#063B2C] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{worker.availability}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#F0ECE1]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 font-extrabold text-sm text-[#11241C]">
                <Star className="w-4 h-4 fill-[#063B2C] text-[#063B2C]" />
                <span>{worker.rating}</span>
              </div>
              <span className="text-[10px] text-[#55685F]">{worker.reviewCount} reviews</span>
            </div>
            <div className="w-px h-8 bg-[#E8E4DA]"></div>
            <div className="text-center">
              <span className="font-extrabold text-sm text-[#063B2C]">{worker.startingPrice}</span>
              <span className="text-[10px] text-[#55685F] block">Standard rate</span>
            </div>
          </div>
        </div>

        {/* Skills & Specialties */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#11241C] uppercase tracking-wider">
            Skills & Services Offered
          </h3>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#D2CEBE] text-xs font-bold text-[#11241C]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* About & Bio */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs space-y-2">
          <h3 className="text-xs font-extrabold text-[#11241C] uppercase tracking-wider">
            About Provider
          </h3>
          <p className="text-xs text-[#55685F] leading-relaxed">
            {worker.bio || worker.description}
          </p>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E4DA] p-4 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCall}
            className="py-3.5 px-3 rounded-2xl bg-[#D2EBE0] text-[#063B2C] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#C2E4D5] cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>
          <button
            onClick={handleChat}
            className="py-3.5 px-3 rounded-2xl bg-[#D2EBE0] text-[#063B2C] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#C2E4D5] cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={handleRequest}
            className="py-3.5 px-3 rounded-2xl bg-[#063B2C] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#084D3A] shadow-md cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
