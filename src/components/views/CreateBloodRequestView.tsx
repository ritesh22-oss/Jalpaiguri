import React, { useState } from 'react';
import {
  Droplet,
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  Phone,
  User,
  Hospital,
  ChevronRight,
  Info,
  ShieldCheck
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { BloodGroup, BloodRequest } from '../../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['Emergency', 'Urgent', 'Normal'] as const;

export const CreateBloodRequestView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { location: userLocation } = useLocation();
  const { isBengali } = useLanguage();
  const { user } = useAuth();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<'Emergency' | 'Urgent' | 'Normal'>('Urgent');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userLocation) return;
    
    setSubmitting(true);
    try {
      const requestData = {
        userId: user.id,
        patientName,
        bloodGroup,
        units,
        urgency,
        hospitalName,
        hospitalAddress,
        lat: userLocation.lat,
        lng: userLocation.lng,
        contactName,
        contactPhone,
        status: 'Open',
        note,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'blood_requests'), requestData);
      alert(isBengali ? 'অনুরোধ সফলভাবে পোস্ট করা হয়েছে!' : 'Blood request posted successfully!');
      navigate('blood');
    } catch (err) {
      console.error('Error creating blood request:', err);
      alert(isBengali ? 'অনুরোধ পোস্ট করতে সমস্যা হয়েছে।' : 'Failed to post blood request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-20 transition-colors">
      <header className="bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => goBack()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#11241C] dark:text-white" />
        </button>
        <div>
          <h1 className="text-sm font-black text-[#11241C] dark:text-white uppercase tracking-tight">
            {isBengali ? 'রক্তের অনুরোধ' : 'Create Blood Request'}
          </h1>
          <p className="text-[10px] font-bold text-[#D9383A] dark:text-red-400 uppercase tracking-wider">
            {isBengali ? 'জরুরি প্রয়োজনে পোস্ট করুন' : 'Emergency Assistance Flow'}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-5 flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-tight">Important Safety Note</h3>
            <p className="text-xs text-red-800/80 dark:text-red-300/80 font-medium leading-relaxed">
              Ensure all details are accurate. MYJPG is a community connector and not a medical authority. Verify donors independently.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Patient Details</h2>
            </div>
            
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-6 space-y-4 shadow-xs">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Full name or Hospital Bed Ref"
                  className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-[#11241C] dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-[#11241C] dark:text-white focus:outline-none transition-colors"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Units (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={units}
                    onChange={(e) => setUnits(parseInt(e.target.value))}
                    className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-[#11241C] dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <Hospital className="w-4 h-4 text-blue-600" />
              <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Hospital Details</h2>
            </div>
            
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-6 space-y-4 shadow-xs">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Jalpaiguri District Hospital"
                  className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-[#11241C] dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        urgency === level 
                          ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30' 
                          : 'bg-[#FAF8F5] dark:bg-white/5 border-[#E8E4DA] dark:border-white/10 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <Phone className="w-4 h-4 text-blue-600" />
              <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contact Information</h2>
            </div>
            
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-6 space-y-4 shadow-xs">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 90000 00000"
                  className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-[#11241C] dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 pl-1">Additional Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Any specific requirement or instructions..."
                  className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-[#11241C] dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${
              submitting 
                ? 'bg-gray-200 dark:bg-white/10 text-gray-400' 
                : 'bg-red-600 text-white shadow-red-500/30 hover:bg-red-700 active:scale-[0.98]'
            }`}
          >
            {submitting ? 'Broadcasting...' : 'Broadcast Emergency Alert'}
            {!submitting && <Droplet className="w-4 h-4 fill-current" />}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 pt-4 pb-10">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by MYJPG Emergency Network</span>
        </div>
      </main>
    </div>
  );
};
