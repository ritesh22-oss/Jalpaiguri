import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  Share2,
  Heart,
  FileText,
  Lock,
  ChevronLeft,
  ExternalLink,
  Plus,
  Trash2,
  AlertTriangle,
  Hospital,
  Scale,
  Users,
  Info,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { useLocation } from '../../context/LocationContext';
import { ViewType, PrivateIncidentNote } from '../../types';

interface SexualViolenceSupportViewProps {
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
}

export const SexualViolenceSupportView: React.FC<SexualViolenceSupportViewProps> = ({ onBack, onNavigate }) => {
  const {
    call112,
    privateNotes,
    addPrivateNote,
    deletePrivateNote,
    shareEmergencyLocation
  } = useSafety();

  const { location } = useLocation();

  const [activeSection, setActiveSection] = useState<'immediate' | 'triage' | 'medical' | 'legal' | 'helplines' | 'diary'>('immediate');

  // Private note creation modal/form
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteCategory, setNoteCategory] = useState<PrivateIncidentNote['category']>('Harassment');
  const [noteText, setNoteText] = useState('');
  const [noteApproxLocation, setNoteApproxLocation] = useState(location?.locality || location?.city || 'Jalpaiguri');
  const [savedNoteRef, setSavedNoteRef] = useState<string | null>(null);

  const handleSavePrivateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const now = new Date();
    const created = addPrivateNote({
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      approximateLocation: noteApproxLocation.trim() || 'Jalpaiguri',
      category: noteCategory,
      notes: noteText.trim()
    });

    setSavedNoteRef(created.referenceNumber);
    setNoteText('');
    setIsAddingNote(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] text-[#11241C] dark:text-white flex flex-col max-w-lg mx-auto pb-24 select-none transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#17231E]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] text-[#11241C] dark:text-white transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-[#11241C] dark:text-white">
              Support & Emergency Resources
            </h1>
            <p className="text-[11px] font-semibold text-[#667085] dark:text-[#A2B3AA]">
              Confidential, Verified Guidance & Helplines
            </p>
          </div>
        </div>

        <button
          onClick={call112}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B42318] hover:bg-[#912018] text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          <span>CALL 112</span>
        </button>
      </header>

      {/* Official Disclaimer */}
      <div className="bg-[#FFF4E5] dark:bg-amber-950/40 border-b border-[#FFE0B2] dark:border-amber-800/30 px-4 py-2.5 flex items-start gap-2 text-xs text-[#7A4100] dark:text-amber-300">
        <Info className="w-4 h-4 text-[#B76E00] dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="font-bold">Disclaimer:</strong> Jalpaiguri Connect is not a law enforcement, healthcare, or medical provider. All helplines and legal aid bodies listed below are verified official Indian governmental and municipal services.
        </p>
      </div>

      {/* Section Filter Pills */}
      <div className="bg-white dark:bg-[#17231E] border-b border-[#E8E4DA] dark:border-white/10 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold transition-colors">
        {[
          { id: 'immediate', label: '🚨 Immediate Safety' },
          { id: 'triage', label: '🧭 Quick Triage' },
          { id: 'helplines', label: '📞 Helplines' },
          { id: 'medical', label: '🏥 Medical Care' },
          { id: 'legal', label: '⚖️ Legal Support' },
          { id: 'diary', label: `🔒 Private Diary (${privateNotes.length})` }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === sec.id
                ? 'bg-[#063B2C] dark:bg-emerald-600 text-white'
                : 'text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A]'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <main className="p-4 space-y-4 flex-1">
        {/* ========================================================= */}
        {/* SECTION 1: IMMEDIATE SAFETY */}
        {/* ========================================================= */}
        {activeSection === 'immediate' && (
          <div className="space-y-4">
            <div className="bg-[#FEF3F2] dark:bg-red-950/40 border border-[#FECDCA] dark:border-red-800/40 rounded-3xl p-5 shadow-xs space-y-4 transition-colors">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#B42318] dark:text-red-400">
                  Immediate Danger Protocol
                </span>
                <h2 className="text-lg font-black text-[#11241C] dark:text-white">
                  If you are in immediate danger right now:
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 bg-white/80 dark:bg-[#17231E]/80 p-3 rounded-2xl border border-[#FECDCA] dark:border-red-800/40">
                  <span className="w-6 h-6 rounded-full bg-[#D92D20] text-white font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h3 className="font-extrabold text-[#11241C] dark:text-white text-sm">
                      Call 112 Immediately
                    </h3>
                    <p className="text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                      National emergency dispatch operators are active 24/7 across all districts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 dark:bg-[#17231E]/80 p-3 rounded-2xl border border-[#FECDCA] dark:border-red-800/40">
                  <span className="w-6 h-6 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h3 className="font-extrabold text-[#11241C] dark:text-white text-sm">
                      Move to a Safe Public Place
                    </h3>
                    <p className="text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                      Head towards a nearby hospital, police outpost, crowded market (such as Dinbazar or Kadamtala), or 24/7 commercial store.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 dark:bg-[#17231E]/80 p-3 rounded-2xl border border-[#FECDCA] dark:border-red-800/40">
                  <span className="w-6 h-6 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h3 className="font-extrabold text-[#11241C] dark:text-white text-sm">
                      Share Location With Someone You Trust
                    </h3>
                    <p className="text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                      Keep a trusted person informed of your approximate location and surroundings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={call112}
                  className="py-3.5 px-3 rounded-2xl bg-[#D92D20] hover:bg-[#B91C1C] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call 112 Now</span>
                </button>

                <button
                  onClick={shareEmergencyLocation}
                  className="py-3.5 px-3 rounded-2xl bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] active:scale-95 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
                  <span>Share Location</span>
                </button>
              </div>
            </div>

            {/* Kotwali Police Station Card */}
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                  Kotwali Police Station (Jalpaiguri Headquarters)
                </h3>
                <span className="text-[11px] font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                  Open 24/7
                </span>
              </div>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Address: Court Complex Road, Jalpaiguri, West Bengal 735101
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="tel:03561224100"
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>03561-224100</span>
                </a>
                <a
                  href="tel:03561222333"
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D92D20]" />
                  <span>Women's Cell</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: QUICK TRIAGE (Need Help / Report Violence) */}
        {/* ========================================================= */}
        {activeSection === 'triage' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-[#11241C] dark:text-white">
                Need Help / Quick Triage
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Select what best matches your current situation for tailored guidance:
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  title: 'I am in danger right now',
                  desc: 'Direct emergency assistance and police dispatch.',
                  action: call112,
                  btnLabel: 'Call 112',
                  color: 'border-[#FECDCA] dark:border-red-800/40 bg-[#FFF0F0] dark:bg-red-950/40 text-[#D92D20] dark:text-red-400'
                },
                {
                  title: 'I need medical attention or examination',
                  desc: 'Nearest 24/7 emergency hospitals & forensic medical units.',
                  action: () => setActiveSection('medical'),
                  btnLabel: 'View Hospitals',
                  color: 'border-[#E8E4DA] dark:border-white/10 bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white'
                },
                {
                  title: 'I want confidential official legal advice',
                  desc: 'Free government legal aid under DLSA Jalpaiguri & NALSA.',
                  action: () => setActiveSection('legal'),
                  btnLabel: 'View Legal Aid',
                  color: 'border-[#E8E4DA] dark:border-white/10 bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white'
                },
                {
                  title: 'I want to speak with a counselor / helpline',
                  desc: '24/7 Women in Distress (181) and Women Helpline (1091).',
                  action: () => setActiveSection('helplines'),
                  btnLabel: 'Call Helplines',
                  color: 'border-[#E8E4DA] dark:border-white/10 bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white'
                },
                {
                  title: 'I want to record private incident notes safely',
                  desc: 'Saved strictly on your device. Never uploaded to servers.',
                  action: () => setActiveSection('diary'),
                  btnLabel: 'Open Private Diary',
                  color: 'border-[#E8E4DA] dark:border-white/10 bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`border rounded-3xl p-4 shadow-xs space-y-2.5 transition-colors ${item.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={item.action}
                    className="w-full py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>{item.btnLabel}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: VERIFIED OFFICIAL HELPLINES */}
        {/* ========================================================= */}
        {activeSection === 'helplines' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-[#11241C] dark:text-white">
                Verified Official Helplines
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Toll-free, 24/7 government numbers verified for Jalpaiguri and West Bengal:
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  name: 'National Emergency Helpline',
                  number: '112',
                  hours: '24x7 Active',
                  scope: 'Police, Fire & Medical Emergency',
                  govtAuthority: 'Ministry of Home Affairs, Govt. of India',
                  badge: 'Primary 24/7'
                },
                {
                  name: 'Women Helpline (All India)',
                  number: '1091',
                  hours: '24x7 Active',
                  scope: 'Police Assistance for Women in Distress',
                  govtAuthority: 'West Bengal Police / Central Govt.'
                },
                {
                  name: 'Women in Distress (WB & India)',
                  number: '181',
                  hours: '24x7 Active',
                  scope: 'Toll-free Counseling, Shelter & Legal Support',
                  govtAuthority: 'Dept. of Women & Child Development, West Bengal'
                },
                {
                  name: 'Childline India (Emergency for Minors)',
                  number: '1098',
                  hours: '24x7 Active',
                  scope: 'Care & Protection for Children in Danger',
                  govtAuthority: 'Ministry of Women and Child Development'
                },
                {
                  name: 'National Commission for Women (NCW)',
                  number: '7827170170',
                  hours: '24x7 Active',
                  scope: 'Assault & Domestic Violence Complaint Line',
                  govtAuthority: 'NCW Official Central Helpline'
                },
                {
                  name: 'Jalpaiguri Police Women’s Cell',
                  number: '03561-222333',
                  hours: 'Office & Emergency Dispatch',
                  scope: 'Local Jalpaiguri District Women Police Wing',
                  govtAuthority: 'Jalpaiguri District Police Headquarters'
                },
                {
                  name: 'DLSA Legal Aid Helpline',
                  number: '15100',
                  hours: '24x7 Legal Service',
                  scope: 'Free Legal Services Authority Help',
                  govtAuthority: 'National Legal Services Authority (NALSA)'
                }
              ].map((hl, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                          {hl.name}
                        </h3>
                        {hl.badge && (
                          <span className="text-[10px] font-bold text-[#D92D20] bg-[#FFF0F0] dark:bg-red-950/60 border border-transparent dark:border-red-800/40 px-2 py-0.5 rounded-full">
                            {hl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5 font-medium">
                        {hl.scope}
                      </p>
                      <p className="text-[11px] text-[#8C9B93] dark:text-[#A2B3AA] mt-0.5">
                        Source: {hl.govtAuthority} • Verified: 2026
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${hl.number.replace(/[^0-9]/g, '')}`}
                    className="w-full py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {hl.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: MEDICAL CARE */}
        {/* ========================================================= */}
        {activeSection === 'medical' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-[#11241C] dark:text-white">
                Hospital & Medical Support
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Official 24/7 healthcare facilities providing emergency medical care and forensic support in Jalpaiguri:
              </p>
            </div>

            <div className="space-y-3">
              {/* Jalpaiguri District Hospital */}
              <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                      Jalpaiguri District Sadar Hospital
                    </h3>
                    <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                      Hospital Road, Jalpaiguri (Near District Court)
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                      24/7 Emergency & Forensic Wing
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
                  Provides immediate medical examination, emergency trauma care, post-exposure prophylaxis (PEP), and certified medical documentation.
                </p>

                <div className="flex gap-2">
                  <a
                    href="tel:03561224001"
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Emergency (03561-224001)</span>
                  </a>
                  <a
                    href="tel:108"
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Hospital className="w-3.5 h-3.5 text-[#D92D20]" />
                    <span>108 Ambulance</span>
                  </a>
                </div>
              </div>

              {/* North Bengal Medical College */}
              <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors">
                <div>
                  <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    North Bengal Medical College & Hospital (NBMCH)
                  </h3>
                  <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    Sushrutanagar, Siliguri-Jalpaiguri Link (Apex Referral Center)
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                    Tertiary Medical Care & Specialty Trauma
                  </span>
                </div>
                <a
                  href="tel:03532585478"
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call NBMCH: 0353-2585478</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 5: LEGAL SUPPORT */}
        {/* ========================================================= */}
        {activeSection === 'legal' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-[#11241C] dark:text-white">
                Official Legal Support & Legal Aid
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Under the Legal Services Authorities Act, women, children, and victims of violence are entitled to free, qualified legal aid:
              </p>
            </div>

            <div className="space-y-3">
              {/* DLSA Jalpaiguri */}
              <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 transition-colors">
                <div>
                  <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                    District Legal Services Authority (DLSA) Jalpaiguri
                  </h3>
                  <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                    District Judges Court Compound, Jalpaiguri 735101
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                    Free Legal Defense & Legal Counseling
                  </span>
                </div>

                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
                  Provides appointed pro-bono advocates, assistance with filing FIRs, victim compensation claims, and court representations.
                </p>

                <div className="flex gap-2">
                  <a
                    href="tel:03561224108"
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>03561-224108</span>
                  </a>
                  <a
                    href="tel:15100"
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
                    <span>15100 (NALSA 24/7)</span>
                  </a>
                </div>
              </div>

              {/* Rights Guide Card */}
              <div className="bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E5E1D5] dark:border-white/10 rounded-3xl p-4 space-y-2 transition-colors">
                <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white">
                  Your Statutory Legal Protections:
                </h4>
                <ul className="text-xs text-[#55685F] dark:text-[#A2B3AA] space-y-1.5 list-disc pl-4 font-medium">
                  <li><strong>Zero FIR:</strong> An FIR can be registered at any police station regardless of jurisdiction.</li>
                  <li><strong>Privacy & Identity:</strong> Disclosure of a survivor's identity is strictly prohibited by Indian law (Section 228A IPC / Section 72 BNS).</li>
                  <li><strong>Female Officer:</strong> Statement must be recorded by a woman police officer or in the presence of a female social worker.</li>
                  <li><strong>Free Legal Representation:</strong> You do not need to pay legal fees for government-appointed legal counsel.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 6: PRIVATE INCIDENT NOTES (DIARY) */}
        {/* ========================================================= */}
        {activeSection === 'diary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#11241C] dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
                  <span>Private Incident Diary</span>
                </h2>
                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                  Confidential notes stored strictly on your device for documentation
                </p>
              </div>

              <button
                onClick={() => setIsAddingNote(true)}
                className="px-3 py-1.5 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>
            </div>

            {/* Privacy Guarantee Box */}
            <div className="bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E5E1D5] dark:border-white/10 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#55685F] dark:text-[#A2B3AA] transition-colors">
              <Lock className="w-4 h-4 text-[#063B2C] dark:text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-[#11241C] dark:text-white font-bold">100% Private:</strong> Notes are saved only in your device's private browser memory. They are <strong className="underline">never automatically uploaded</strong> to public servers or visible to other users.
              </p>
            </div>

            {savedNoteRef && (
              <div className="bg-[#E6F4EA] dark:bg-emerald-950/60 border border-[#A6E9B9] dark:border-emerald-800/40 rounded-2xl p-3 text-xs flex items-center justify-between">
                <span className="text-[#063B2C] dark:text-emerald-300 font-bold">
                  ✓ Note saved with Reference ID: {savedNoteRef}
                </span>
                <button
                  onClick={() => setSavedNoteRef(null)}
                  className="text-xs text-[#55685F] dark:text-[#A2B3AA] underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* List of Notes */}
            <div className="space-y-3">
              {privateNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2.5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 font-bold text-[10px] text-[#063B2C] dark:text-emerald-400">
                          {note.category}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#8C9B93] dark:text-[#A2B3AA]">
                          {note.referenceNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8C9B93] dark:text-[#A2B3AA]" />
                          {note.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8C9B93] dark:text-[#A2B3AA]" />
                          {note.time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8C9B93] dark:text-[#A2B3AA]" />
                          {note.approximateLocation}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deletePrivateNote(note.id)}
                      className="p-1.5 text-[#8C9B93] hover:text-[#D92D20] dark:text-[#A2B3AA] dark:hover:text-red-400 transition-colors cursor-pointer"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#11241C] dark:text-white whitespace-pre-wrap leading-relaxed bg-[#FAF8F5] dark:bg-[#121E19] p-3 rounded-2xl border border-[#E8E4DA] dark:border-white/10">
                    {note.notes}
                  </p>
                </div>
              ))}

              {privateNotes.length === 0 && (
                <div className="bg-white dark:bg-[#17231E] border border-dashed border-[#D2CEBE] dark:border-white/15 rounded-3xl p-6 text-center space-y-2 transition-colors">
                  <FileText className="w-8 h-8 text-[#8C9B93] dark:text-[#A2B3AA] mx-auto" />
                  <p className="text-sm font-bold text-[#11241C] dark:text-white">No Private Notes Recorded</p>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                    You can record date, time, and descriptions of incidents confidentially for your own records or future legal use.
                  </p>
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="mt-2 px-4 py-2 bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Add Private Record
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* ADD PRIVATE NOTE FORM MODAL */}
      {/* ========================================================= */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-[#E8E4DA] dark:border-white/10 transition-colors">
            <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">
              Record Private Incident Note
            </h3>

            <form onSubmit={handleSavePrivateNote} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#11241C] dark:text-white block mb-1">
                  Category
                </label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#D2CEBE] dark:border-white/10 bg-[#FAF8F5] dark:bg-[#121E19] font-semibold text-[#11241C] dark:text-white focus:outline-none"
                >
                  <option value="Harassment">Harassment</option>
                  <option value="Stalking">Stalking</option>
                  <option value="Assault">Assault</option>
                  <option value="Domestic Violence">Domestic Violence</option>
                  <option value="Immediate Danger">Immediate Danger</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#11241C] dark:text-white block mb-1">
                  Approximate Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kadamtala, Hospital Road"
                  value={noteApproxLocation}
                  onChange={(e) => setNoteApproxLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#D2CEBE] dark:border-white/10 bg-[#FAF8F5] dark:bg-[#121E19] font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#11241C] dark:text-white block mb-1">
                  Confidential Details / What Happened
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record factual details, timeline, vehicle numbers, or observations..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#D2CEBE] dark:border-white/10 bg-[#FAF8F5] dark:bg-[#121E19] font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold hover:bg-[#084D3A] cursor-pointer"
                >
                  Save Privately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
