import React, { useState } from 'react';
import {
  User,
  MapPin,
  Droplet,
  HeartHandshake,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup } from '../../types';

export const BloodView: React.FC = () => {
  const { navigate } = useNav();
  const { bloodDonors, bloodRequests, registerBloodDonor, submitBloodRequest } = useApp();
  const { user } = useAuth();

  // Mode: 'home' | 'request-form' | 'donors-list'
  const [activeSection, setActiveSection] = useState<'main' | 'request' | 'find-donors'>('main');

  // Register Donor form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'O+');
  const [phone, setPhone] = useState(user?.phone || '');
  const [area, setArea] = useState('Kadamtala, Ward 12');
  const [selectedSearchGroup, setSelectedSearchGroup] = useState<string>('All');

  // Emergency request form state
  const [patientName, setPatientName] = useState('');
  const [reqHospital, setReqHospital] = useState('Jalpaiguri District Hospital Blood Bank');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqUrgency, setReqUrgency] = useState<'Immediate (Critical)' | 'Within 24 Hours' | 'Planned'>('Immediate (Critical)');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Please fill in your name and phone number');
      return;
    }
    registerBloodDonor({
      name: fullName + ` (Anonymous ID #${Math.floor(10 + Math.random() * 89)})`,
      bloodGroup,
      area,
      distance: '1.2 km',
      availability: 'Available Now',
      lastDonation: 'None recorded'
    });
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name / reference');
      return;
    }
    submitBloodRequest({
      patientName,
      bloodGroup,
      hospital: reqHospital,
      units: reqUnits,
      urgency: reqUrgency,
      contactPerson: user?.name || 'Attendant',
      phone: phone || '+91 98320 00000',
      location: area || 'Jalpaiguri Town'
    });
    setActiveSection('main');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Exact Header matching Screenshot 8 */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/40 dark:border-white/10 transition-colors">
        <div
          onClick={() => navigate('profile')}
          className="w-10 h-10 rounded-full bg-[#EFECE6] dark:bg-[#17231E] flex items-center justify-center text-[#11241C] dark:text-white cursor-pointer transition-colors"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </div>

        <h1 className="text-lg font-extrabold text-[#11241C] dark:text-white tracking-tight">
          Jalpaiguri Connect
        </h1>

        <div
          onClick={() => navigate('alerts')}
          className="w-10 h-10 flex items-center justify-center text-[#11241C] dark:text-white cursor-pointer transition-colors"
        >
          <MapPin className="w-5 h-5 stroke-[2]" />
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* Top Blood Droplet Icon & Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-full bg-[#FFEBEA] dark:bg-red-950/50 text-[#D9383A] dark:text-red-400 flex items-center justify-center mx-auto shadow-xs border border-transparent dark:border-red-900/40">
            <Droplet className="w-7 h-7 fill-[#D9383A] dark:fill-red-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#063B2C] dark:text-[#4ECCA3] tracking-tight">
            Blood Help
          </h2>
          <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed max-w-[300px] mx-auto">
            Urgent community support system. Connect with donors or register to save lives.
          </p>
        </div>

        {/* 3 Prominent Action Cards matching Screenshot 8 */}
        <div className="space-y-3.5">
          {/* 1. I Need Blood (Soft Pink Card) */}
          <div
            onClick={() => setActiveSection(activeSection === 'request' ? 'main' : 'request')}
            className="bg-[#FFEBEA] dark:bg-[#281517] border border-[#FFD2D0] dark:border-red-900/40 rounded-3xl p-5 text-center shadow-xs hover:border-[#D9383A] active:scale-98 transition-all cursor-pointer space-y-1.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-red-900/40 text-[#D9383A] dark:text-red-400 flex items-center justify-center mx-auto">
              <Droplet className="w-6 h-6 fill-[#D9383A] dark:fill-red-400" />
            </div>
            <h3 className="font-extrabold text-base text-[#11241C] dark:text-white tracking-tight">
              I Need Blood
            </h3>
            <p className="text-xs font-semibold text-[#D9383A] dark:text-red-300">
              Post an emergency request
            </p>
          </div>

          {/* 2. I Want to Donate (Soft Mint Card) */}
          <div
            onClick={() => {
              const el = document.getElementById('register-donor-form');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#DCEEE3] dark:bg-[#122A20] border border-[#C2E4D2] dark:border-emerald-900/40 rounded-3xl p-5 text-center shadow-xs hover:border-[#063B2C] active:scale-98 transition-all cursor-pointer space-y-1.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-emerald-900/40 text-[#063B2C] dark:text-[#4ECCA3] flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6 text-[#063B2C] dark:text-[#4ECCA3]" />
            </div>
            <h3 className="font-extrabold text-base text-[#11241C] dark:text-white tracking-tight">
              I Want to Donate
            </h3>
            <p className="text-xs font-semibold text-[#063B2C] dark:text-[#4ECCA3]">
              Respond to active requests
            </p>
          </div>

          {/* 3. Find Donors (Soft Neutral Warm Gray Card) */}
          <div
            onClick={() => setActiveSection(activeSection === 'find-donors' ? 'main' : 'find-donors')}
            className="bg-[#EFECE6] dark:bg-[#1C2822] border border-[#E0DCD3] dark:border-white/10 rounded-3xl p-5 text-center shadow-xs hover:border-[#11241C] active:scale-98 transition-all cursor-pointer space-y-1.5"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-white/10 text-[#11241C] dark:text-white flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-base text-[#11241C] dark:text-white tracking-tight">
              Find Donors
            </h3>
            <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA]">
              Search by blood group & area
            </p>
          </div>
        </div>

        {/* Emergency Blood Request Sub-View */}
        {activeSection === 'request' && (
          <div className="bg-white dark:bg-[#17231E] border-2 border-[#FFD2D0] dark:border-red-900/40 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in transition-colors">
            <div className="flex items-center gap-2 text-[#D9383A] dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">Post Urgent Blood Request</h3>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">
                  Patient / Case Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU Bed 4 Thalassemia"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 rounded-xl p-3 text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#73857C] focus:outline-none focus:border-[#D9383A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 rounded-xl p-3 text-xs font-bold text-[#11241C] dark:text-white focus:outline-none"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg} className="bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white">{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reqUnits}
                    onChange={(e) => setReqUnits(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 rounded-xl p-3 text-xs font-bold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">
                  Hospital / Blood Bank
                </label>
                <input
                  type="text"
                  value={reqHospital}
                  onChange={(e) => setReqHospital(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 rounded-xl p-3 text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#D9383A] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#B92628] active:scale-98 transition-all cursor-pointer"
              >
                Broadcast Urgent Blood Alert
              </button>
            </form>
          </div>
        )}

        {/* Live Active Requests Banner */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">Active Emergency Needs</h3>
            <span className="text-[11px] font-bold text-[#D9383A] dark:text-red-400 bg-[#FFEBEA] dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-transparent dark:border-red-900/40">
              {bloodRequests.length} Urgent
            </span>
          </div>

          {bloodRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-[#17231E] border border-[#FFD2D0] dark:border-red-900/30 rounded-3xl p-4 shadow-xs space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-[#FFEBEA] dark:bg-red-950/50 text-[#D9383A] dark:text-red-400 text-xs font-extrabold border border-transparent dark:border-red-900/40">
                  {req.bloodGroup} Needed ({req.units} Unit)
                </span>
                <span className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-medium">{req.postedAt}</span>
              </div>
              <h4 className="font-bold text-sm text-[#11241C] dark:text-white">{req.hospital}</h4>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">Case: {req.patientName}</p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => alert(`Contacting coordinator: ${req.phone}`)}
                  className="flex-1 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-[#084D3A]"
                >
                  I Can Donate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Find Donors Directory Section */}
        {activeSection === 'find-donors' && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4 animate-in fade-in transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">Nearby Donors</h3>
              <select
                value={selectedSearchGroup}
                onChange={(e) => setSelectedSearchGroup(e.target.value)}
                className="text-xs font-bold bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 rounded-lg px-2 py-1 text-[#11241C] dark:text-white"
              >
                <option value="All" className="bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white">All Groups</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg} className="bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white">{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {bloodDonors
                .filter((d) => selectedSearchGroup === 'All' || d.bloodGroup === selectedSearchGroup)
                .map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#D9383A] dark:text-red-400 bg-[#FFEBEA] dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-transparent dark:border-red-900/40">
                          {donor.bloodGroup}
                        </span>
                        <span className="text-xs font-bold text-[#11241C] dark:text-white">{donor.name}</span>
                      </div>
                      <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                        {donor.area} • {donor.distance}
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Consent-based request sent to donor! They will be notified securely.')}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white shadow-xs cursor-pointer"
                    >
                      Request Contact
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Form: Register as Blood Donor matching Screenshot 8 */}
        <div id="register-donor-form" className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4 transition-colors">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#11241C] dark:text-white tracking-tight">
              Register as Blood Donor
            </h3>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
              Your registration can save a life during emergencies in Jalpaiguri. Your details remain secure.
            </p>
          </div>

          <form onSubmit={handleRegisterDonor} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-[#11241C] dark:text-white mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#FAF5EE] dark:bg-[#121E19] border border-[#E5E0D5] dark:border-white/10 rounded-2xl p-3.5 text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#73857C] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
              />
            </div>

            {/* Select Blood Group */}
            <div>
              <label className="block text-[11px] font-bold text-[#11241C] dark:text-white mb-1">
                Select Blood Group
              </label>
              <div className="relative">
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full bg-[#FAF5EE] dark:bg-[#121E19] border border-[#E5E0D5] dark:border-white/10 rounded-2xl p-3.5 text-xs font-bold text-[#11241C] dark:text-white focus:outline-none appearance-none cursor-pointer"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg} className="bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white">{bg}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#55685F] dark:text-[#A2B3AA]">
                  ▼
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-[#11241C] dark:text-white mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98320 XXXXX"
                className="w-full bg-[#FAF5EE] dark:bg-[#121E19] border border-[#E5E0D5] dark:border-white/10 rounded-2xl p-3.5 text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#73857C] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
              />
            </div>

            {/* Area / Ward */}
            <div>
              <label className="block text-[11px] font-bold text-[#11241C] dark:text-white mb-1">
                Area/Ward
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Kadamtala, Mohitnagar, Ward 8"
                className="w-full bg-[#FAF5EE] dark:bg-[#121E19] border border-[#E5E0D5] dark:border-white/10 rounded-2xl p-3.5 text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#73857C] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
              />
            </div>

            {/* Register Now Button matching Screenshot 8 */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
