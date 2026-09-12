import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Droplet,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  AlertTriangle,
  Info,
  ChevronRight,
  Share2,
  Heart
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { BloodDonor } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { formatDistance } from '../../utils/location';

export const DonorDetailsView: React.FC = () => {
  const { goBack, params } = useNav();
  const { isBengali } = useLanguage();
  const { location: userLocation } = useLocation();
  const donorId = params.donorId;

  const [donor, setDonor] = useState<BloodDonor | null>(params.donor || null);
  const [loading, setLoading] = useState(!params.donor);

  useEffect(() => {
    if (!donorId || donor) return;

    const fetchDonor = async () => {
      try {
        const donorSnap = await getDoc(doc(db, 'blood_donors', donorId));
        if (donorSnap.exists()) {
          setDonor({ ...donorSnap.data() as BloodDonor, id: donorSnap.id });
        }
      } catch (err) {
        console.error('Error fetching donor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonor();
  }, [donorId, donor]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, group: string) => {
    const text = `Hello, I found your contact on MYJPG Blood Help. We have an emergency need for ${group} blood. Are you available to help?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#0B132B]">
        <Droplet className="w-8 h-8 text-red-500 animate-pulse" />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#0B132B] p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-lg font-black text-[#11241C] dark:text-white uppercase tracking-tight">Donor Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6">This donor might have opted out or the link is invalid.</p>
        <button onClick={() => goBack()} className="px-8 py-3 bg-[#11241C] dark:bg-white text-white dark:text-[#0B132B] rounded-2xl font-black text-xs uppercase">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-24 transition-colors">
      <header className="bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => goBack()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#11241C] dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-black text-[#11241C] dark:text-white uppercase tracking-tight">
            {isBengali ? 'রক্তদাতার তথ্য' : 'Donor Details'}
          </h1>
          <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            {isBengali ? 'জরুরি যোগাযোগ প্রোফাইল' : 'Emergency Contact Profile'}
          </p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-gray-400">
          <Share2 className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-5 space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[40px] p-8 shadow-xs text-center relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10">
            <Droplet className="w-32 h-32 fill-red-600" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[32px] bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 shadow-xl mb-6 ring-8 ring-white dark:ring-white/5">
              <Droplet className="w-12 h-12 fill-current" />
            </div>
            
            <h2 className="text-2xl font-black text-[#11241C] dark:text-white tracking-tight">{donor.name}</h2>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-black px-4 py-1.5 rounded-xl bg-red-600 text-white uppercase tracking-widest shadow-lg shadow-red-500/20">
                Group {donor.bloodGroup}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{donor.approximateArea}</span>
              {donor.distanceKm && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-black text-[#11241C] dark:text-white">{donor.distanceKm.toFixed(1)} KM away</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 text-center shadow-xs">
            <Clock className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Availability</div>
            <div className="text-[10px] font-black text-[#11241C] dark:text-white uppercase truncate">{donor.availability}</div>
          </div>
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 text-center shadow-xs">
            <Droplet className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Donations</div>
            <div className="text-[10px] font-black text-[#11241C] dark:text-white uppercase">{donor.donationsCount} Times</div>
          </div>
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 text-center shadow-xs">
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Last Donated</div>
            <div className="text-[10px] font-black text-[#11241C] dark:text-white uppercase">{donor.lastDonation || 'Never'}</div>
          </div>
        </div>

        {/* Note Section */}
        <div className="bg-[#eff6ff] dark:bg-blue-950/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">Donor's Personal Note</h3>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed italic">
            "{donor.note || 'Available to donate in case of genuine emergencies. Please contact only for verified needs in Jalpaiguri town area.'}"
          </p>
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleWhatsApp(donor.phone, donor.bloodGroup)}
            className="py-5 bg-[#25D366] text-white rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 font-black text-xs uppercase tracking-widest active:scale-95 hover:bg-blue-400 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            WhatsApp
          </button>
          <button
            onClick={() => handleCall(donor.phone)}
            className="py-5 bg-[#11241C] dark:bg-white text-white dark:text-[#0B132B] rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-black/10 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </button>
        </div>

        {/* Reporting / Safety */}
        <div className="pt-4 space-y-4">
          <div className="bg-gray-100 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Inappropriate or Wrong Info?</span>
            </div>
            <button className="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-red-500/30">Report Donor</button>
          </div>

          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Safe & Secured by MYJPG</span>
            </div>
            <p className="text-[9px] text-gray-400 leading-relaxed max-w-[280px]">
              MYJPG does not guarantee blood availability or medical safety. Always verify donors and follow standard hospital protocols.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
