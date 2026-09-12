import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Globe,
  Lock,
  Droplet,
  Save,
  Info,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { BloodGroup, BloodDonor } from '../../types';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorSettingsView: React.FC = () => {
  const { goBack } = useNav();
  const { isBengali } = useLanguage();
  const { location: userLocation } = useLocation();
  const { user, updateProfile } = useAuth();

  const [isEmergencyDonor, setIsEmergencyDonor] = useState(user?.isBloodDonor || false);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'O+');
  const [availability, setAvailability] = useState<'Available Now' | 'Available Today' | 'Unavailable'>('Available Now');
  const [agreedToSearch, setAgreedToSearch] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDonorData = async () => {
      if (!user) return;
      try {
        const donorRef = doc(db, 'blood_donors', user.id);
        const donorSnap = await getDoc(donorRef);
        
        if (donorSnap.exists()) {
          const data = donorSnap.data() as BloodDonor;
          setIsEmergencyDonor(true);
          setBloodGroup(data.bloodGroup);
          setAvailability(data.availability);
          setAgreedToSearch(data.agreedToSearch);
          setIsVisible(data.isVisible);
          setNote(data.note || '');
        }
      } catch (err) {
        console.error('Error fetching donor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [user]);

  const handleSave = async () => {
    if (!user || !userLocation) return;
    setSaving(true);
    try {
      const donorRef = doc(db, 'blood_donors', user.id);
      
      if (isEmergencyDonor) {
        const donorData: Partial<BloodDonor> = {
          userId: user.id,
          name: user.name,
          bloodGroup,
          phone: user.phone,
          availability,
          agreedToSearch,
          isVisible,
          note,
          lat: userLocation.lat,
          lng: userLocation.lng,
          approximateArea: userLocation.locality || 'Jalpaiguri Town',
          lastUpdated: new Date().toISOString(),
          verified: true, // Assuming profile is verified
          donationsCount: 0 // In real app, this would be tracked
        };
        
        await setDoc(donorRef, donorData, { merge: true });
        await updateProfile({ isBloodDonor: true, bloodGroup });
      } else {
        // If opting out, we set isVisible to false instead of deleting for records
        await updateDoc(donorRef, { isVisible: false, agreedToSearch: false });
        await updateProfile({ isBloodDonor: false });
      }
      
      alert(isBengali ? 'তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Donor settings saved successfully!');
      goBack();
    } catch (err) {
      console.error('Error saving donor settings:', err);
      alert(isBengali ? 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#0B132B]">
      <Droplet className="w-8 h-8 text-red-500 animate-pulse" />
    </div>;
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
            {isBengali ? 'রক্তদাতা সেটিংস' : 'Donor Management'}
          </h1>
          <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            {isBengali ? 'আপনার জীবনদানকারী প্রোফাইল' : 'Emergency Registry Status'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {saving ? '...' : <Save className="w-4 h-4" />}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-5 space-y-6">
        {/* Toggle Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isEmergencyDonor ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                <Heart className={`w-6 h-6 ${isEmergencyDonor ? 'fill-current' : ''}`} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#11241C] dark:text-white">Emergency Blood Donor</h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Appear in search results</p>
              </div>
            </div>
            <button
              onClick={() => setIsEmergencyDonor(!isEmergencyDonor)}
              className={`w-14 h-7 rounded-full relative transition-colors ${isEmergencyDonor ? 'bg-green-500' : 'bg-gray-300 dark:bg-white/10'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isEmergencyDonor ? 'left-8' : 'left-1'}`} />
            </button>
          </div>

          {!isEmergencyDonor && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                By enabling this, you agree to show your blood group and approximate location to nearby users in urgent need.
              </p>
            </div>
          )}
        </div>

        {isEmergencyDonor && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Core Info */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Blood Information</h2>
              <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-6 space-y-4 shadow-xs">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 pl-1">Blood Group</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        onClick={() => setBloodGroup(bg)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                          bloodGroup === bg 
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30' 
                            : 'bg-[#FAF8F5] dark:bg-white/5 border-[#E8E4DA] dark:border-white/10 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 pl-1">Current Availability</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Available Now', 'Available Today', 'Unavailable'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAvailability(opt as any)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                          availability === opt 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-[#FAF8F5] dark:bg-white/5 border-[#E8E4DA] dark:border-white/10 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Visibility */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Privacy Controls</h2>
              <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-2 divide-y divide-gray-100 dark:divide-white/5 shadow-xs">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-[#11241C] dark:text-white uppercase tracking-tight">Public Search</h4>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Appear on Map</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAgreedToSearch(!agreedToSearch)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${agreedToSearch ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${agreedToSearch ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-[#11241C] dark:text-white uppercase tracking-tight">Profile Visibility</h4>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{isVisible ? 'Anyone can see group' : 'Only admins see group'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVisible(!isVisible)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${isVisible ? 'bg-purple-600' : 'bg-gray-300 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isVisible ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Donor Bio */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Personal Message</h2>
              <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-6 shadow-xs">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Please call me for emergency O+ needs only. Thalassemia patients are welcome."
                  className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 text-xs font-bold text-[#11241C] dark:text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider">Privacy & Trust</h4>
                <p className="text-[10px] text-blue-800/70 dark:text-blue-300/70 font-medium leading-relaxed">
                  We only show your approximate location (locality) to other users. Your phone number is only shared when a user explicitly requests contact for a verified need.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Donor Profile'}
          <Save className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 pt-4">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">End-to-End Encrypted Identity</span>
        </div>
      </main>
    </div>
  );
};
