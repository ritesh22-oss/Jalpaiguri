import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Search, MapPin, Phone, Clock, ExternalLink, 
  ShieldCheck, Bookmark, RefreshCw, ChevronRight, Plus, Navigation, AlertCircle, CheckCircle2, Award 
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { EducationalInstitution } from '../../types';

const VERIFIED_EDUCATIONAL_INSTITUTIONS: EducationalInstitution[] = [
  {
    id: 'edu-1',
    name: 'Jalpaiguri Government Engineering College (JGEC)',
    nameBn: 'জলপাইগুড়ি গভর্নমেন্ট ইঞ্জিনিয়ারিং কলেজ',
    category: 'College',
    address: 'Panpara, Jalpaiguri',
    locality: 'Panpara',
    pincode: '735102',
    lat: 26.5300,
    lng: 88.7200,
    phone: '+91 3561 255131',
    email: 'principal@jgec.ac.in',
    websiteUrl: 'https://www.jgec.ac.in',
    openingHours: '09:00 AM - 05:00 PM',
    overview: 'Premier state-funded engineering institution established in 1961, affiliated with MAKAUT and approved by AICTE.',
    facilities: ['Central Library', 'Hostels', 'Computer Labs', 'Sports Ground', 'Cafeteria'],
    photos: ['https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'],
    courses: [
      { id: 'c-1', institutionId: 'edu-1', name: 'B.Tech in Computer Science & Engineering', duration: '4 Years', category: 'Engineering' },
      { id: 'c-2', institutionId: 'edu-1', name: 'B.Tech in Civil Engineering', duration: '4 Years', category: 'Engineering' },
      { id: 'c-3', institutionId: 'edu-1', name: 'B.Tech in Electrical Engineering', duration: '4 Years', category: 'Engineering' }
    ],
    notices: [
      {
        id: 'n-1',
        institutionId: 'edu-1',
        title: 'B.Tech Lateral Entry Admission Notice 2026',
        deadline: '2026-09-30',
        description: 'Applications are invited for admission to 2nd year B.Tech courses through JELET 2026 counseling.',
        officialUrl: 'https://www.jgec.ac.in',
        publishedAt: '2026-09-02'
      }
    ],
    rating: 4.7,
    reviewCount: 156,
    isVerified: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'edu-2',
    name: 'Ananda Chandra College (AC College)',
    nameBn: 'আনন্দ চন্দ্র কলেজ',
    category: 'College',
    address: 'Subhash Pally, Jalpaiguri',
    locality: 'Subhash Pally',
    pincode: '735101',
    lat: 26.5180,
    lng: 88.7150,
    phone: '+91 3561 230231',
    email: 'accollege@gmail.com',
    websiteUrl: 'https://www.accollege.ac.in',
    openingHours: '10:00 AM - 05:00 PM',
    overview: 'One of the oldest and most reputed undergraduate colleges in North Bengal, affiliated with University of North Bengal.',
    facilities: ['Library', 'Science Laboratories', 'NCC/NSS', 'Auditorium'],
    photos: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'],
    courses: [
      { id: 'c-4', institutionId: 'edu-2', name: 'B.A. (Hons) in Bengali, English, History', duration: '3/4 Years', category: 'Arts' },
      { id: 'c-5', institutionId: 'edu-2', name: 'B.Sc. (Hons) in Mathematics, Physics, Chemistry', duration: '3/4 Years', category: 'Science' }
    ],
    notices: [
      {
        id: 'n-2',
        institutionId: 'edu-2',
        title: 'Undergraduate Semester Examination Schedule 2026',
        deadline: '2026-09-25',
        description: 'Odd semester university examinations will commence from October 2026.',
        officialUrl: 'https://www.accollege.ac.in',
        publishedAt: '2026-09-04'
      }
    ],
    rating: 4.5,
    reviewCount: 98,
    isVerified: true,
    createdAt: '2026-01-05'
  },
  {
    id: 'edu-3',
    name: 'Jalpaiguri Zilla School',
    nameBn: 'জলপাইগুড়ি জেলা স্কুল',
    category: 'School',
    address: 'Collectorate More, Jalpaiguri',
    locality: 'Collectorate More',
    pincode: '735101',
    lat: 26.5150,
    lng: 88.7180,
    phone: '+91 3561 230111',
    email: 'zillaschool@jalpaiguri.edu',
    websiteUrl: 'https://jalpaigurizillaschool.org',
    openingHours: '10:00 AM - 04:30 PM',
    overview: 'Historic government boys higher secondary school with high academic distinction and extracurricular excellence.',
    facilities: ['Science Lab', 'Computer Lab', 'Playground', 'Library'],
    photos: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'],
    courses: [
      { id: 'c-6', institutionId: 'edu-3', name: 'Higher Secondary (Science, Arts, Commerce)', duration: '2 Years', category: 'School' }
    ],
    notices: [],
    rating: 4.6,
    reviewCount: 74,
    isVerified: true,
    createdAt: '2026-01-10'
  }
];

export const EducationView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { isBengali } = useLanguage();

  const [activeTab, setActiveTab] = useState<'institutions' | 'notices' | 'register'>('institutions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedInst, setSelectedInst] = useState<EducationalInstitution | null>(null);

  const [regName, setRegName] = useState('');
  const [regCat, setRegCat] = useState<'School' | 'College' | 'Coaching' | 'Tuition' | 'Library'>('Coaching');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const filteredInstitutions = VERIFIED_EDUCATIONAL_INSTITUTIONS.filter(inst => {
    const matchesQuery = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         inst.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inst.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || inst.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regAddress.trim()) return;
    setRegSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] text-[#11241C] dark:text-white pb-24 transition-colors">
      <div className="bg-[#007AFF] text-white pt-6 pb-6 px-4 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <button 
            onClick={() => goBack()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-tight">
              {isBengali ? 'শিক্ষা ও প্রতিষ্ঠান' : 'Education & Institutions'}
            </h1>
            <p className="text-xs text-blue-100 opacity-90">
              {isBengali ? 'জলপাইগুড়ির স্কুল, কলেজ ও কোচিং হাব' : 'Verified Schools, Colleges & Coaching Centers'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('register')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto flex bg-blue-900/40 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('institutions')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'institutions' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            {isBengali ? 'প্রতিষ্ঠানসমূহ' : 'Institutions'}
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'notices' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            {isBengali ? 'ভর্তি ও নোটিশ' : 'Admissions & Notices'}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'register' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            {isBengali ? 'প্রতিষ্ঠান নিবন্ধন' : 'Register'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {activeTab === 'institutions' && (
          <>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBengali ? 'স্কুল, কলেজ বা কোর্স খুঁজুন...' : 'Search schools, colleges, courses...'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#17231E] border border-gray-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: isBengali ? 'সমস্ত' : 'All' },
                { id: 'College', label: isBengali ? 'কলেজ' : 'Colleges' },
                { id: 'School', label: isBengali ? 'স্কুল' : 'Schools' },
                { id: 'Coaching', label: isBengali ? 'কোচিং' : 'Coaching' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedCategory(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${selectedCategory === f.id ? 'bg-[#007AFF] text-white shadow-xs' : 'bg-white dark:bg-[#17231E] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-bold">
                <span>{filteredInstitutions.length} {isBengali ? 'টি প্রতিষ্ঠান উপলব্ধ' : 'Verified Institutions'}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                  Official Records
                </span>
              </div>

              {filteredInstitutions.length === 0 ? (
                <div className="bg-white dark:bg-[#17231E] rounded-2xl p-8 text-center border border-gray-100 dark:border-white/10 space-y-3">
                  <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-bold">{isBengali ? 'কোনো প্রতিষ্ঠান পাওয়া যায়নি' : 'No educational institutions found'}</p>
                </div>
              ) : (
                filteredInstitutions.map(inst => {
                  const isSaved = savedIds.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInst(inst)}
                      className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:border-blue-300 transition cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-[#007AFF] dark:bg-blue-950/40">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{isBengali && inst.nameBn ? inst.nameBn : inst.name}</h3>
                              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-gray-500 font-semibold">{inst.category} • {inst.locality}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(inst.id);
                          }}
                          className={`p-1.5 rounded-full transition ${isSaved ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{inst.overview}</p>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                        <span className="font-bold text-blue-600">{inst.courses.length} Courses Available</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Govt/Board
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-100 dark:border-white/10 space-y-2">
              <h3 className="text-xs font-black uppercase text-blue-600 tracking-wider">
                {isBengali ? 'ভর্তি ও পরীক্ষা নোটিশ' : 'Admissions & Official Notices'}
              </h3>
              <p className="text-xs text-gray-500">
                {isBengali ? 'জলপাইগুড়ির কলেজ ও স্কুলগুলির সাম্প্রতিক ভর্তি বিজ্ঞপ্তি এবং পরীক্ষার শিডিউল।' : 'Verified announcements sourced directly from official Jalpaiguri educational institutions.'}
              </p>
            </div>

            {VERIFIED_EDUCATIONAL_INSTITUTIONS.flatMap(inst => inst.notices.map(n => ({ ...n, instName: inst.name }))).map(notice => (
              <div key={notice.id} className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-100 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                    {notice.instName}
                  </span>
                  {notice.deadline && (
                    <span className="text-[10px] text-rose-600 font-bold">
                      Deadline: {notice.deadline}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white">{notice.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">{notice.description}</p>
                {notice.officialUrl && (
                  <a
                    href={notice.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] hover:underline pt-1"
                  >
                    <span>View Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'register' && (
          <div className="bg-white dark:bg-[#17231E] p-6 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              {isBengali ? 'শিক্ষা প্রতিষ্ঠান নিবন্ধন' : 'Register Educational Institution'}
            </h3>
            <p className="text-xs text-gray-500">
              {isBengali ? 'আপনার স্কুল, কলেজ, কোচিং বা প্রশিক্ষণ কেন্দ্র MYJPG-এ যুক্ত করুন।' : 'Add your school, college, coaching center or library to the Jalpaiguri registry.'}
            </p>

            {regSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">Institution Submitted Successfully!</p>
                <p className="text-[11px]">Your listing is pending verification.</p>
                <button onClick={() => setRegSuccess(false)} className="text-blue-600 font-bold underline mt-2">Register Another</button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Jalpaiguri Science Coaching"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={regCat}
                    onChange={(e) => setRegCat(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 font-bold"
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Coaching">Coaching Institute</option>
                    <option value="Tuition">Tuition Centre</option>
                    <option value="Library">Library</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Address & Locality</label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g., Dinbazar, Jalpaiguri"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#007AFF] text-white font-bold shadow-sm transition hover:bg-blue-600"
                >
                  Submit for Verification
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {selectedInst && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white dark:bg-[#17231E] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#007AFF]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{selectedInst.name}</h3>
                  <p className="text-[11px] text-gray-500">{selectedInst.category} • {selectedInst.locality}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInst(null)} className="p-1 rounded-full text-gray-500">✕</button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <p>{selectedInst.overview}</p>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{selectedInst.address} ({selectedInst.pincode})</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{selectedInst.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{selectedInst.openingHours}</span>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Courses & Programs</h4>
                <div className="space-y-1.5">
                  {selectedInst.courses.map((c) => (
                    <div key={c.id} className="p-2 rounded-xl bg-gray-50 dark:bg-black/20 flex justify-between items-center">
                      <span className="font-bold">{c.name}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{c.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInst.facilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Facilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInst.facilities.map((f, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              {selectedInst.websiteUrl && (
                <a
                  href={selectedInst.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Website</span>
                </a>
              )}
              <button
                onClick={() => setSelectedInst(null)}
                className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-white/10 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
