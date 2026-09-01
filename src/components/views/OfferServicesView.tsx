import React, { useState, useRef } from 'react';
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
  Sparkles,
  Camera,
  X,
  Clock,
  Award,
  Zap,
  MessageCircle,
  Tag
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Worker } from '../../types';

export const OfferServicesView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { user } = useAuth();
  const { addWorker } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [professionTitle, setProfessionTitle] = useState('Certified Electrician & Inverter Specialist');
  const [category, setCategory] = useState<Worker['category']>('Electrician');
  const [phone, setPhone] = useState(user?.phone || '+91 98320 ');
  const [whatsapp, setWhatsapp] = useState(user?.phone || '');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [startingPrice, setStartingPrice] = useState('₹250/visit');
  const [serviceArea, setServiceArea] = useState('Kadamtala, Dinbazar, Jalpaiguri');
  const [skills, setSkills] = useState<string[]>([
    'House Wiring',
    'Inverter Setup',
    'MCB & Fuse Repair',
    'Appliance Servicing'
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [availability, setAvailability] = useState<Worker['availability']>('Available Now');
  const [isEmergencyAvailable, setIsEmergencyAvailable] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState('WB-JPG-EL-2024');
  const [description, setDescription] = useState(
    'Experienced local professional providing guaranteed prompt service across Jalpaiguri town with quick response time.'
  );

  // Profile Picture state (Supports custom uploaded image OR preset avatars)
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80'
  );
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  ];

  const suggestedSkillsByCategory: Record<string, string[]> = {
    Electrician: ['House Wiring', 'Inverter Setup', 'Fan & Cooler Repair', 'MCB Tripping', 'LED Lighting', 'Switchboard Repair'],
    Plumber: ['Pipe Leak Repair', 'Water Motor Setup', 'Bathroom Sanitary Fitting', 'Overhead Tank Clean', 'Tap Installation'],
    Carpenter: ['Furniture Assembly', 'Door & Lock Fitting', 'Modular Kitchen', 'Wood Polishing', 'Wardrobe Repair'],
    Painter: ['Wall Emulsion', 'Waterproofing & Damp Proof', 'Exterior Weathercoat', 'Wood Enamel', 'Texture Paint'],
    Mason: ['Tile & Marble Fitting', 'Brickwork & Plaster', 'Roof Concrete Repair', 'Boundary Wall'],
    'AC Repair': ['Split AC Servicing', 'Window AC Repair', 'Gas Refill', 'Jet Wash Servicing', 'Cooling Trouble'],
    Cleaner: ['Deep Home Cleaning', 'Sofa & Carpet Wash', 'Kitchen Degreasing', 'Water Tank Cleaning'],
    Mechanic: ['Two-Wheeler Service', 'Car Battery Jumpstart', 'Brake & Oil Change', 'Engine Diagnostic'],
    Cook: ['Home Bengali Cooking', 'North Indian Dishes', 'Party Catering', 'Dietary & Healthy Food']
  };

  // Handle Custom Image Upload (supports camera & gallery)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImagePreview(base64);
        setAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleToggleSuggestedSkill = (skill: string) => {
    if (skills.includes(skill)) {
      handleRemoveSkill(skill);
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWorker: Worker = {
      id: 'w-' + Date.now(),
      name: name.trim(),
      profession: professionTitle.trim() || `${category} Specialist`,
      category: category,
      rating: 5.0,
      reviewCount: 1,
      distance: '0.4 km',
      availability: availability,
      startingPrice: startingPrice.startsWith('₹') ? startingPrice : `₹${startingPrice}`,
      avatarUrl: uploadedImagePreview || avatarUrl,
      phone: phone.trim() || '+91 98320 00000',
      verified: true,
      experienceYears: Number(experienceYears) || 3,
      serviceArea: serviceArea.trim() || 'Jalpaiguri',
      skills: skills.length > 0 ? skills : [category, 'General Service'],
      description: description.trim(),
      completedJobs: 1,
      reviews: [
        {
          author: 'Jalpaiguri Connect Verified',
          rating: 5,
          date: 'Just now',
          comment: 'Verified professional registered on the municipal local trades directory.'
        }
      ]
    };

    addWorker(newWorker);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-6 flex flex-col justify-between max-w-md mx-auto select-none">
        <div className="pt-16 text-center space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-[#E6F4EA] text-[#063B2C] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
            Profile Live in Directory!
          </h2>
          <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs max-w-xs mx-auto text-left flex items-center gap-3">
            <img
              src={uploadedImagePreview || avatarUrl}
              alt="Worker avatar"
              className="w-12 h-12 rounded-2xl object-cover border border-[#D2CEBE]"
            />
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-[#11241C] truncate">{name}</h3>
              <p className="text-xs text-[#063B2C] font-bold truncate">{professionTitle}</p>
              <p className="text-[11px] text-[#55685F]">{startingPrice} • {availability}</p>
            </div>
          </div>
          <p className="text-xs text-[#55685F] leading-relaxed max-w-[290px] mx-auto">
            Your worker profile is now broadcasting in real time across Jalpaiguri. Citizens can call, chat, and request emergency services directly.
          </p>
        </div>

        <div className="space-y-3 pt-6">
          <button
            onClick={() => navigate('workers')}
            className="w-full py-4 rounded-2xl bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-sm shadow-md cursor-pointer active:scale-98 transition-all"
          >
            View My Profile in Workers List
          </button>
          <button
            onClick={() => navigate('home')}
            className="w-full py-3 text-center text-xs font-bold text-[#55685F] hover:text-[#11241C] cursor-pointer"
          >
            Back to Home Dashboard
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
          <div>
            <h1 className="text-lg font-extrabold text-[#11241C] leading-tight">Join as Worker</h1>
            <p className="text-[11px] text-[#55685F] font-semibold">Register Trade & Services</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#E6F4EA] to-[#F1F9F4] p-4 rounded-3xl border border-[#A7D7B9] space-y-1">
          <div className="flex items-center gap-1.5 text-[#063B2C] font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Join Jalpaiguri Local Workers Network</span>
          </div>
          <p className="text-xs text-[#55685F]">
            Direct customer calls, instant messaging, zero commission fees.
          </p>
        </div>

        {/* 1. CUSTOM PROFILE PICTURE UPLOAD */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#11241C] uppercase">
              Worker Profile Picture *
            </label>
            <span className="text-[11px] text-[#063B2C] font-bold">Add Your Photo</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={uploadedImagePreview || avatarUrl}
                alt="Profile Preview"
                className="w-20 h-20 rounded-3xl object-cover border-2 border-[#063B2C] shadow-sm"
              />
              {uploadedImagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImagePreview(null);
                    setAvatarUrl(presetAvatars[0]);
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs"
                  title="Remove uploaded image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#E6F4EA] hover:bg-[#D2EBE0] text-[#063B2C] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#A7D7B9]"
              >
                <Camera className="w-4 h-4" />
                <span>Upload From Device / Camera</span>
              </button>
              <p className="text-[10px] text-[#8C9B93]">
                Supports JPG, PNG up to 5MB. Shows on your worker card.
              </p>
            </div>
          </div>

          {/* Preset Avatars Fallback */}
          <div className="pt-2 border-t border-[#F0ECE1]">
            <span className="block text-[11px] font-semibold text-[#55685F] mb-2">
              Or pick an instant avatar:
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {presetAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar option ${i + 1}`}
                  onClick={() => {
                    setUploadedImagePreview(null);
                    setAvatarUrl(url);
                  }}
                  className={`w-11 h-11 rounded-2xl object-cover cursor-pointer border-2 transition-all shrink-0 ${
                    avatarUrl === url && !uploadedImagePreview
                      ? 'border-[#063B2C] ring-2 ring-[#063B2C]/20 scale-105'
                      : 'border-[#D2CEBE] opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2. BASIC PROFESSIONAL INFO */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#063B2C]">
            Professional Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Subir Karmakar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                Primary Trade *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as any;
                  setCategory(newCat);
                  setProfessionTitle(`Master ${newCat}`);
                }}
                className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Painter">Painter</option>
                <option value="Mason">Mason / Rajmistri</option>
                <option value="AC Repair">AC & Refrigerator Repair</option>
                <option value="Cleaner">Cleaner / Housekeeping</option>
                <option value="Mechanic">Mechanic / Toto Repair</option>
                <option value="Cook">Cook / Home Chef</option>
                <option value="Other">Other Skilled Trade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min={1}
                max={45}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Headline / Specialization Title
            </label>
            <input
              type="text"
              placeholder="e.g. Certified Inverter Specialist & High-Voltage Electrician"
              value={professionTitle}
              onChange={(e) => setProfessionTitle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* 3. CONTACT & PRICING */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#063B2C]">
            Contact, Rates & Availability
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98320 XXXXX"
                className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
                Starting Price / Rate
              </label>
              <input
                type="text"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="₹250/visit"
                className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-bold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Current Availability Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Available Now', 'Available Today', 'Busy'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAvailability(status)}
                  className={`py-2 px-2 rounded-2xl text-[11px] font-bold border transition-all cursor-pointer ${
                    availability === status
                      ? 'bg-[#063B2C] text-white border-[#063B2C] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#55685F] border-[#D2CEBE] hover:bg-white'
                  }`}
                >
                  {status === 'Available Now' ? '⚡ Now' : status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">
              Service Areas Covered in Jalpaiguri
            </label>
            <input
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g. Kadamtala, Dinbazar, Pandapara, Silpasamiti Para"
              className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
            />
          </div>

          {/* 24/7 Emergency Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FEF9C3] border border-[#FEF08A]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#854D0E]" />
              <div>
                <h4 className="text-xs font-extrabold text-[#854D0E]">24/7 Emergency Service</h4>
                <p className="text-[10px] text-[#A16207]">Available for urgent nighttime & emergency calls</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isEmergencyAvailable}
              onChange={(e) => setIsEmergencyAvailable(e.target.checked)}
              className="w-4 h-4 text-[#063B2C] rounded-md focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        {/* 4. SKILLS & SPECIALIZATIONS */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#063B2C]">
              Skills & Services Offered
            </h3>
            <span className="text-[10px] text-[#55685F]">{skills.length} added</span>
          </div>

          {/* Selected Skills Badges */}
          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-[#E6F4EA] text-[#063B2C] border border-[#A7D7B9] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add specific skill (e.g. Jet Pump Setup)"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl px-3 py-2 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-[#063B2C] text-white font-bold text-xs rounded-2xl hover:bg-[#084D3A] cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Quick Suggestions for Selected Category */}
          {suggestedSkillsByCategory[category] && (
            <div className="pt-2 border-t border-[#F0ECE1]">
              <span className="text-[11px] font-semibold text-[#55685F] block mb-1.5">
                Popular suggestions for {category}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSkillsByCategory[category].map((s) => {
                  const isSelected = skills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleToggleSuggestedSkill(s)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#063B2C] text-white'
                          : 'bg-[#FAF8F5] text-[#55685F] border border-[#E2DED4] hover:border-[#063B2C]'
                      }`}
                    >
                      {isSelected ? `✓ ${s}` : `+ ${s}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. BIO & ABOUT WORK */}
        <div className="bg-white rounded-3xl p-4 border border-[#E8E4DA] shadow-xs space-y-2">
          <label className="block text-xs font-bold text-[#11241C] uppercase">
            About Your Work & Experience
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your working experience, honesty, and guarantees..."
            className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:bg-white focus:outline-none"
          ></textarea>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-[#063B2C] text-white font-extrabold text-sm shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Publish My Worker Profile</span>
        </button>
      </form>
    </div>
  );
};
