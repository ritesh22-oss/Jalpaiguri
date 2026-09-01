import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Upload,
  User,
  Phone,
  IndianRupee,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Worker } from '../../types';

export const OfferServicesView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { user } = useAuth();
  const { addWorker } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [profession, setProfession] = useState<Worker['category']>('Electrician');
  const [phone, setPhone] = useState(user?.phone || '+91 98320 ');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [startingPrice, setStartingPrice] = useState('₹300/visit');
  const [serviceArea, setServiceArea] = useState('Kadamtala, Jalpaiguri');
  const [skills, setSkills] = useState('House Wiring, Inverter Repair, Switchboard Setup');
  const [description, setDescription] = useState('Experienced professional providing top-quality local service across Jalpaiguri town with quick response time.');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWorker: Worker = {
      id: 'w-' + Date.now(),
      name: name.trim(),
      profession: profession,
      category: profession,
      rating: 5.0,
      reviewCount: 1,
      distance: '0.5 km',
      availability: 'Available Now',
      startingPrice: startingPrice.startsWith('₹') ? startingPrice : `₹${startingPrice}/visit`,
      avatarUrl: avatarUrl,
      phone: phone || '+91 98320 12345',
      verified: true,
      experienceYears: Number(experienceYears) || 3,
      serviceArea: serviceArea || 'Jalpaiguri',
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      description: description,
      completedJobs: 1,
      reviews: [
        {
          author: 'Citizen Verified',
          rating: 5,
          date: 'Just now',
          comment: 'Registered professional ready for immediate requests.'
        }
      ]
    };

    addWorker(newWorker);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-6 flex flex-col justify-between max-w-md mx-auto select-none">
        <div className="pt-16 text-center space-y-4">
          <div className="w-20 h-20 bg-[#E6F4EA] text-[#063B2C] rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
            Profile Published!
          </h2>
          <p className="text-sm text-[#55685F] leading-relaxed max-w-[280px] mx-auto">
            Your trade profile has been added to the Jalpaiguri Workers Directory. Citizens can now view your skills, call, message, and book your services directly.
          </p>
        </div>

        <div className="space-y-3 pt-6">
          <button
            onClick={() => navigate('workers')}
            className="w-full py-4 rounded-2xl bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-sm shadow-md cursor-pointer"
          >
            View in Workers Directory
          </button>
          <button
            onClick={() => navigate('home')}
            className="w-full py-3 text-center text-xs font-bold text-[#55685F] hover:text-[#11241C] cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-extrabold text-[#11241C]">Add Work & Profile</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="bg-gradient-to-r from-[#E6F4EA] to-[#F1F9F4] p-4 rounded-2xl border border-[#A7D7B9] space-y-1">
          <div className="flex items-center gap-1.5 text-[#063B2C] font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Join Jalpaiguri Local Workers Network</span>
          </div>
          <p className="text-xs text-[#55685F]">
            Showcase your skills to thousands of local households. Zero commission, direct bookings.
          </p>
        </div>

        {/* Profile Avatar Selection */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase mb-2">
            Choose Profile Picture
          </label>
          <div className="flex items-center gap-3">
            {sampleAvatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Avatar option"
                onClick={() => setAvatarUrl(url)}
                className={`w-14 h-14 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                  avatarUrl === url
                    ? 'border-[#063B2C] ring-2 ring-[#063B2C]/20 scale-105'
                    : 'border-[#D2CEBE] opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ramesh Sarkar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
          />
        </div>

        {/* Profession & Experience */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Profession / Category *
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value as any)}
              className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
            >
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
              <option value="Mason">Mason</option>
              <option value="Cook">Cook</option>
              <option value="Cleaner">Cleaner</option>
              <option value="AC Technician">AC Technician</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={experienceYears}
              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
              className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Phone & Visiting Fee */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Contact Phone *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98320 XXXXX"
              className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Starting Price / Fee
            </label>
            <input
              type="text"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="e.g. ₹300/visit"
              className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
            />
          </div>
        </div>

        {/* Service Area */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
            Service Areas in Jalpaiguri
          </label>
          <input
            type="text"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            placeholder="e.g. Kadamtala, Dinbazar, Pandapara"
            className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
            Skills & Specializations (Comma separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Wiring, Inverter, Fan repair"
            className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
          />
        </div>

        {/* Bio / Description */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
            About Your Work
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your services, working hours, and tools..."
            className="w-full bg-white border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-[#063B2C] text-white font-bold text-sm shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Publish Worker Profile</span>
        </button>
      </form>
    </div>
  );
};
