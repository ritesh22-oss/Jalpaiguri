import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Landmark,
  Search,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  FileCheck,
  Building2,
  Layers,
  Baby,
  HeartPulse,
  Briefcase,
  GraduationCap,
  Sparkles,
  Zap,
  Tent,
  AlertCircle,
  HelpCircle,
  BadgeCheck,
  Send,
  Calendar,
  Compass
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import {
  GovernmentService,
  GovtServiceCategory,
  GovtScheme,
  GovtAlert,
  SavedGovtApplication,
  VERIFIED_GOVERNMENT_SERVICES,
  VERIFIED_SCHEMES_CATALOG,
  VERIFIED_GOVERNMENT_ALERTS,
  isSafeGovUrl
} from '../../data/governmentServices';

export const GovernmentServicesView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { isDarkMode } = useTheme();

  // Navigation tab within hub: 'services' | 'schemes' | 'alerts' | 'tracking'
  const [activeTab, setActiveTab] = useState<'services' | 'schemes' | 'alerts' | 'tracking'>('services');

  // Search & Filters for Services
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | GovtServiceCategory>('ALL');

  // Interactive Scheme Discovery state
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<string>('All');
  const [schemeSearchQuery, setSchemeSearchQuery] = useState<string>('');

  // Modals state
  const [redirectModalData, setRedirectModalData] = useState<{
    url: string;
    serviceName: string;
    domain: string;
  } | null>(null);

  const [checklistModalData, setChecklistModalData] = useState<GovernmentService | null>(null);
  const [reportLinkModalData, setReportLinkModalData] = useState<GovernmentService | null>(null);
  const [reportFeedback, setReportFeedback] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Application Tracking (persisted in localStorage)
  const [savedApplications, setSavedApplications] = useState<SavedGovtApplication[]>(() => {
    try {
      const stored = localStorage.getItem('jpg_saved_govt_applications');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    // Default sample tracker to illustrate value immediately
    return [
      {
        id: 'app-default-1',
        serviceId: 'cert-caste',
        serviceName: 'Caste Certificate (OBC)',
        referenceNumber: 'WB-OBC-2024-88491',
        appliedDate: '2024-08-28',
        status: 'Under Review',
        officialPortal: 'https://castcertificatewb.gov.in',
        statusUrl: 'https://castcertificatewb.gov.in/view-status/',
        notes: 'Submitted documents at SDO Office Jalpaiguri.',
        updatedAt: '2024-09-01'
      }
    ];
  });

  // New Application Modal form state
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppRef, setNewAppRef] = useState('');
  const [newAppDate, setNewAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAppStatus, setNewAppStatus] = useState<SavedGovtApplication['status']>('Submitted');
  const [newAppPortal, setNewAppPortal] = useState('https://edistrict.wb.gov.in');
  const [newAppNotes, setNewAppNotes] = useState('');

  // Save applications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jpg_saved_govt_applications', JSON.stringify(savedApplications));
    } catch {
      // ignore
    }
  }, [savedApplications]);

  // Categories list
  const CATEGORIES: ('ALL' | GovtServiceCategory)[] = [
    'ALL',
    'MUNICIPAL SERVICES',
    'CERTIFICATES',
    'LAND & PROPERTY',
    'TRANSPORT',
    'UTILITY SERVICES',
    'EDUCATION & SCHOLARSHIPS',
    'HEALTH & WELFARE',
    'EMPLOYMENT',
    'GOVERNMENT SCHEMES'
  ];

  // Filtered Services
  const filteredServices = useMemo(() => {
    return VERIFIED_GOVERNMENT_SERVICES.filter((srv) => {
      if (selectedCategory !== 'ALL' && srv.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inName = srv.name.toLowerCase().includes(q);
      const inDesc = srv.shortDesc.toLowerCase().includes(q);
      const inDept = srv.department.toLowerCase().includes(q);
      const inReqs = srv.requirements.some((r) => r.toLowerCase().includes(q));

      return inName || inDesc || inDept || inReqs;
    });
  }, [searchQuery, selectedCategory]);

  // Filtered Schemes
  const filteredSchemes = useMemo(() => {
    return VERIFIED_SCHEMES_CATALOG.filter((scheme) => {
      if (schemeCategoryFilter !== 'All' && scheme.targetCategory !== schemeCategoryFilter) {
        return false;
      }
      if (!schemeSearchQuery.trim()) return true;

      const q = schemeSearchQuery.toLowerCase().trim();
      return (
        scheme.name.toLowerCase().includes(q) ||
        (scheme.bengaliName && scheme.bengaliName.toLowerCase().includes(q)) ||
        scheme.whoItIsFor.toLowerCase().includes(q) ||
        scheme.benefits.toLowerCase().includes(q)
      );
    });
  }, [schemeCategoryFilter, schemeSearchQuery]);

  // Trigger External Link Confirmation
  const handleOpenExternal = (url: string, serviceName: string) => {
    try {
      const parsed = new URL(url);
      setRedirectModalData({
        url,
        serviceName,
        domain: parsed.hostname
      });
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const confirmRedirect = () => {
    if (redirectModalData) {
      window.open(redirectModalData.url, '_blank', 'noopener,noreferrer');
      setRedirectModalData(null);
    }
  };

  // Add Application to Tracker
  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppRef.trim()) return;

    const newEntry: SavedGovtApplication = {
      id: `app-${Date.now()}`,
      serviceId: 'custom',
      serviceName: newAppName.trim(),
      referenceNumber: newAppRef.trim(),
      appliedDate: newAppDate,
      status: newAppStatus,
      officialPortal: newAppPortal.trim() || 'https://edistrict.wb.gov.in',
      statusUrl: newAppPortal.trim(),
      notes: newAppNotes.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setSavedApplications((prev) => [newEntry, ...prev]);
    setIsAddAppModalOpen(false);
    setNewAppName('');
    setNewAppRef('');
    setNewAppNotes('');
  };

  const handleDeleteApplication = (id: string) => {
    setSavedApplications((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit report link feedback
  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportLinkModalData(null);
      setReportFeedback('');
    }, 1500);
  };

  return (
    <div
      className={`min-h-screen pb-28 max-w-md mx-auto select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0B1310] text-[#E1EBE6]' : 'bg-[#FAF8F5] text-[#11241C]'
      }`}
    >
      {/* Sticky Header */}
      <header
        className={`sticky top-0 z-30 px-4 pt-5 pb-3 border-b backdrop-blur-md transition-colors ${
          isDarkMode
            ? 'bg-[#0B1310]/90 border-[#1B2B24]'
            : 'bg-[#FAF8F5]/90 border-[#E8E4DA]/70'
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={goBack}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-[#14231C] text-emerald-300 hover:bg-[#1E332A]'
                : 'bg-white border border-[#E8E4DA] text-[#063B2C] hover:bg-[#F2EFE9]'
            }`}
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>Government Hub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Official
              </span>
            </h1>
            <p className="text-[10px] opacity-70">Jalpaiguri Citizen Access Gateway</p>
          </div>
        </div>

        <button
          onClick={() => navigate('faq')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
            isDarkMode
              ? 'bg-[#14231C] border-[#20362B] text-emerald-300'
              : 'bg-white border-[#E8E4DA] text-[#063B2C]'
          }`}
          title="Govt Services FAQ"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="text-[11px]">FAQ</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Transparency / Non-Government Platform Disclaimer Card */}
        <div
          className={`rounded-3xl p-4 border transition-colors ${
            isDarkMode
              ? 'bg-[#101D17] border-[#1C3328]'
              : 'bg-[#063B2C] text-white border-transparent shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Landmark className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs tracking-wide">
                  Official Citizen Navigation Gateway
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/20 text-emerald-100">
                  WB & GoI
                </span>
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-emerald-100'
                }`}
              >
                Jalpaiguri Connect is a citizen navigation platform. Applications and payments are
                submitted securely on official state and central government portals.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div
          className={`p-1 rounded-2xl border flex items-center justify-between text-xs font-bold gap-1 ${
            isDarkMode ? 'bg-[#101B16] border-[#1B2D24]' : 'bg-white border-[#E8E4DA]'
          }`}
        >
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              activeTab === 'services'
                ? isDarkMode
                  ? 'bg-emerald-500 text-black shadow-xs font-black'
                  : 'bg-[#063B2C] text-white shadow-xs font-black'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Services ({VERIFIED_GOVERNMENT_SERVICES.length})
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex-1 py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              activeTab === 'schemes'
                ? isDarkMode
                  ? 'bg-emerald-500 text-black shadow-xs font-black'
                  : 'bg-[#063B2C] text-white shadow-xs font-black'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Find Schemes
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              activeTab === 'alerts'
                ? isDarkMode
                  ? 'bg-emerald-500 text-black shadow-xs font-black'
                  : 'bg-[#063B2C] text-white shadow-xs font-black'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Alerts ({VERIFIED_GOVERNMENT_ALERTS.length})
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              activeTab === 'tracking'
                ? isDarkMode
                  ? 'bg-emerald-500 text-black shadow-xs font-black'
                  : 'bg-[#063B2C] text-white shadow-xs font-black'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            My Apps ({savedApplications.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SERVICES DIRECTORY                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search caste, birth, property tax, land, driving..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs font-medium border outline-hidden transition-all ${
                  isDarkMode
                    ? 'bg-[#101B16] border-[#1E332B] focus:border-emerald-400 text-white placeholder:text-gray-500'
                    : 'bg-white border-[#D2CEBE] focus:border-[#063B2C] text-[#11241C] placeholder:text-[#8C9B93]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-emerald-500 text-black shadow-xs'
                          : 'bg-[#063B2C] text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-[#122019] text-gray-300 border border-[#1E352B] hover:bg-[#1A2E24]'
                        : 'bg-white text-[#55685F] border border-[#E8E4DA] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Services' : cat}
                  </button>
                );
              })}
            </div>

            {/* Quick Result Counter */}
            <div className="flex items-center justify-between text-xs px-1 font-semibold opacity-70">
              <span>
                Showing {filteredServices.length}{' '}
                {filteredServices.length === 1 ? 'service' : 'services'}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                All Links Official
              </span>
            </div>

            {/* Service Cards List */}
            {filteredServices.length > 0 ? (
              <div className="space-y-3.5">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className={`rounded-3xl p-4 border space-y-3 transition-all ${
                      isDarkMode
                        ? 'bg-[#101B16] border-[#1C3328] hover:border-[#274738]'
                        : 'bg-white border-[#E8E4DA] hover:border-[#C8C2B2] shadow-xs'
                    }`}
                  >
                    {/* Header: Dept & Verification Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              isDarkMode
                                ? 'bg-[#182C22] text-emerald-300'
                                : 'bg-[#E6F4EA] text-[#063B2C]'
                            }`}
                          >
                            {srv.category}
                          </span>
                          <span className="text-[10px] opacity-60">Verified {srv.lastVerified}</span>
                        </div>
                        <h3 className="font-black text-sm leading-snug">{srv.name}</h3>
                        <p className="text-[11px] opacity-75 font-medium">{srv.department}</p>
                      </div>

                      <div
                        className="w-8 h-8 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"
                        title="Verified Authority"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs opacity-80 leading-relaxed">{srv.shortDesc}</p>

                    {/* Official Verification Notice Tag */}
                    <div
                      className={`p-2.5 rounded-2xl text-[11px] font-bold flex items-center justify-between border ${
                        isDarkMode
                          ? 'bg-[#13231C] border-[#1D362B] text-emerald-300'
                          : 'bg-[#F2FBF6] border-[#C3EAD4] text-[#085A43]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>Official Government Portal • {srv.authority}</span>
                      </div>
                      <span className="text-[10px] opacity-70 font-mono">.gov.in / official</span>
                    </div>

                    {/* Action Buttons: Apply, Status, Requirements */}
                    <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {srv.hasDirectApply && (
                          <button
                            onClick={() =>
                              handleOpenExternal(srv.applyUrl || srv.officialUrl, srv.name)
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <span>Apply Online</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {srv.hasStatusTrack && (
                          <button
                            onClick={() =>
                              handleOpenExternal(srv.statusUrl || srv.officialUrl, srv.name)
                            }
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'bg-[#14231C] border-[#223B2F] text-emerald-300 hover:bg-[#1C3328]'
                                : 'bg-[#FAF8F5] border-[#D2CEBE] text-[#063B2C] hover:bg-[#EAE5D8]'
                            }`}
                          >
                            <span>Check Status</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => setChecklistModalData(srv)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
                              : 'bg-white border-[#E8E4DA] text-[#55685F] hover:bg-[#FAF8F5]'
                          }`}
                          title="View Required Documents"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Documents</span>
                        </button>
                      </div>

                      {/* Small Report Broken Link Button */}
                      <button
                        onClick={() => setReportLinkModalData(srv)}
                        className="text-[10px] opacity-60 hover:opacity-100 hover:underline flex items-center gap-1 text-gray-500 cursor-pointer ml-auto"
                        title="Report outdated or broken government link"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>Report link</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`p-8 text-center rounded-3xl border ${
                  isDarkMode ? 'bg-[#101B16] border-[#1C3328]' : 'bg-white border-[#E8E4DA]'
                }`}
              >
                <Search className="w-9 h-9 mx-auto opacity-40 mb-2" />
                <h3 className="font-extrabold text-sm mb-1">No services found</h3>
                <p className="text-xs opacity-70 mb-3">
                  No government services matched "{searchQuery}".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="px-4 py-2 bg-[#063B2C] text-white font-bold text-xs rounded-xl"
                >
                  View All Services
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SCHEME DISCOVERY WIZARD                                            */}
        {/* ========================================================================= */}
        {activeTab === 'schemes' && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-3xl border space-y-2.5 ${
                isDarkMode ? 'bg-[#101B16] border-[#1C3328]' : 'bg-white border-[#E8E4DA] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Find Government Schemes</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Interactive Filter
                </span>
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                Filter state welfare programs, scholarships, and citizen grants based on your
                occupation, category, or household criteria.
              </p>

              {/* Target Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 pt-1">
                {[
                  'All',
                  'Women',
                  'Student',
                  'Farmer',
                  'Worker',
                  'Senior Citizen',
                  'General'
                ].map((cat) => {
                  const isSel = schemeCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSchemeCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                        isSel
                          ? isDarkMode
                            ? 'bg-emerald-500 text-black'
                            : 'bg-[#063B2C] text-white'
                          : isDarkMode
                          ? 'bg-[#14231C] text-gray-300 border border-[#22392E]'
                          : 'bg-[#FAF8F5] text-[#55685F] border border-[#D2CEBE]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schemes List */}
            <div className="space-y-3.5">
              {filteredSchemes.map((sch) => (
                <div
                  key={sch.id}
                  className={`p-4 rounded-3xl border space-y-3 ${
                    isDarkMode
                      ? 'bg-[#101B16] border-[#1C3328]'
                      : 'bg-white border-[#E8E4DA] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm">{sch.name}</h4>
                        {sch.bengaliName && (
                          <span className="text-xs font-bold opacity-75 text-emerald-600 dark:text-emerald-400">
                            ({sch.bengaliName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-75 mt-0.5">{sch.department}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDarkMode
                          ? 'bg-[#182C22] text-emerald-300'
                          : 'bg-[#E6F4EA] text-[#063B2C]'
                      }`}
                    >
                      {sch.targetCategory}
                    </span>
                  </div>

                  {/* Benefits Box */}
                  <div
                    className={`p-3 rounded-2xl text-xs space-y-1 border ${
                      isDarkMode
                        ? 'bg-[#14231C] border-[#1F362B] text-emerald-300'
                        : 'bg-[#F2FBF6] border-[#C3EAD4] text-[#063B2C]'
                    }`}
                  >
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Benefits / Entitlement:
                    </span>
                    <p className="font-semibold leading-relaxed">{sch.benefits}</p>
                  </div>

                  {/* Eligibility & Details */}
                  <div className="space-y-1.5 text-xs opacity-85">
                    <div>
                      <span className="font-bold text-[11px] opacity-70">Target Citizen: </span>
                      <span>{sch.whoItIsFor}</span>
                    </div>

                    <div>
                      <span className="font-bold text-[11px] opacity-70">
                        Application Method:{' '}
                      </span>
                      <span>{sch.applicationMethod}</span>
                    </div>
                  </div>

                  {/* Required Documents List */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider block">
                      Required Documents:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sch.requiredDocuments.map((doc, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded-md ${
                            isDarkMode
                              ? 'bg-gray-800/80 text-gray-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          ✓ {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] opacity-60">Verified {sch.lastVerified}</span>
                    <button
                      onClick={() => handleOpenExternal(sch.officialUrl, sch.name)}
                      className="px-3.5 py-1.5 bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VERIFIED GOVERNMENT ALERTS                                         */}
        {/* ========================================================================= */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
                isDarkMode
                  ? 'bg-[#14231C] border-[#1F362B] text-emerald-300'
                  : 'bg-[#F2FBF6] border-[#C3EAD4] text-[#063B2C]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <p className="leading-relaxed">
                These notices originate strictly from authorized departments of the Government of
                West Bengal and Jalpaiguri Municipality. Community reports are kept separate in the
                Alerts tab.
              </p>
            </div>

            <div className="space-y-3.5">
              {VERIFIED_GOVERNMENT_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-3xl border space-y-3 ${
                    isDarkMode
                      ? 'bg-[#101B16] border-[#1C3328]'
                      : 'bg-white border-[#E8E4DA] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isDarkMode
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {alert.badge}
                        </span>
                        <span className="text-[10px] opacity-60">Published {alert.publishedDate}</span>
                      </div>
                      <h4 className="font-extrabold text-sm leading-snug">{alert.title}</h4>
                      <p className="text-[11px] opacity-75 font-medium">{alert.source}</p>
                    </div>
                  </div>

                  <p className="text-xs opacity-85 leading-relaxed">{alert.description}</p>

                  <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] opacity-60">Authority: {alert.authority}</span>
                    {alert.officialNoticeUrl && (
                      <button
                        onClick={() => handleOpenExternal(alert.officialNoticeUrl!, alert.title)}
                        className="px-3 py-1.5 bg-[#063B2C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-[#084D3A] cursor-pointer shadow-xs"
                      >
                        <span>Open Official Notice</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: APPLICATION TRACKING                                               */}
        {/* ========================================================================= */}
        {activeTab === 'tracking' && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#101B16] border-[#1C3328]' : 'bg-white border-[#E8E4DA] shadow-xs'
              }`}
            >
              <div>
                <h3 className="font-extrabold text-sm">My Government Services</h3>
                <p className="text-xs opacity-70">
                  Track reference numbers and statuses locally on your device.
                </p>
              </div>
              <button
                onClick={() => setIsAddAppModalOpen(true)}
                className="px-3 py-1.5 bg-[#063B2C] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer hover:bg-[#084D3A]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save App</span>
              </button>
            </div>

            {savedApplications.length > 0 ? (
              <div className="space-y-3">
                {savedApplications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-3xl border space-y-3 ${
                      isDarkMode
                        ? 'bg-[#101B16] border-[#1C3328]'
                        : 'bg-white border-[#E8E4DA] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'Action Required'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status}
                          </span>
                          <span className="text-[10px] opacity-60">Applied: {app.appliedDate}</span>
                        </div>
                        <h4 className="font-extrabold text-sm mt-1">{app.serviceName}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Remove tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div
                      className={`p-2.5 rounded-2xl text-xs font-mono border flex items-center justify-between ${
                        isDarkMode
                          ? 'bg-[#14231C] border-[#1F362B]'
                          : 'bg-[#FAF8F5] border-[#E8E4DA]'
                      }`}
                    >
                      <span className="opacity-70">Ref No:</span>
                      <span className="font-bold select-all">{app.referenceNumber}</span>
                    </div>

                    {app.notes && (
                      <p className="text-xs opacity-75 italic">"{app.notes}"</p>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                      <button
                        onClick={() =>
                          handleOpenExternal(
                            app.statusUrl || app.officialPortal,
                            app.serviceName
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-[#063B2C] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-[#084D3A] cursor-pointer"
                      >
                        <span>Track on Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`p-8 text-center rounded-3xl border ${
                  isDarkMode ? 'bg-[#101B16] border-[#1C3328]' : 'bg-white border-[#E8E4DA]'
                }`}
              >
                <FileCheck className="w-10 h-10 mx-auto opacity-40 mb-2" />
                <h3 className="font-extrabold text-sm mb-1">No tracked applications yet</h3>
                <p className="text-xs opacity-70 max-w-xs mx-auto mb-4">
                  Save your Caste Certificate, Property Tax, or Trade License application number to
                  track updates easily.
                </p>
                <button
                  onClick={() => setIsAddAppModalOpen(true)}
                  className="px-4 py-2 bg-[#063B2C] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Add Your First Application
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EXTERNAL LINK CONFIRMATION (CRITICAL TRUST REQUIREMENT)          */}
      {/* ========================================================================= */}
      {redirectModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-[#101B16] border-[#1C3328] text-white' : 'bg-white border-[#E8E4DA]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm">Official Portal Redirection</h3>
              </div>
              <button
                onClick={() => setRedirectModalData(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs opacity-85 leading-relaxed">
              <p>
                You are leaving <strong>Jalpaiguri Connect</strong> and opening the verified
                official government website:
              </p>

              <div
                className={`p-3 rounded-2xl border font-mono text-xs space-y-1 ${
                  isDarkMode
                    ? 'bg-[#14231C] border-emerald-500/30 text-emerald-300'
                    : 'bg-[#F2FBF6] border-emerald-200 text-[#063B2C]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Government Server</span>
                </div>
                <div className="break-all font-semibold select-all text-xs">
                  https://{redirectModalData.domain}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Never share sensitive passwords with anyone. All government submissions occur
                  directly on the official portal.
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setRedirectModalData(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmRedirect}
                className="flex-1 py-2.5 bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DOCUMENT REQUIREMENTS CHECKLIST                                  */}
      {/* ========================================================================= */}
      {checklistModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#101B16] border-[#1C3328] text-white' : 'bg-white border-[#E8E4DA]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm">Before You Apply</h3>
              </div>
              <button
                onClick={() => setChecklistModalData(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#063B2C] dark:text-emerald-300">
                {checklistModalData.name}
              </h4>
              <p className="text-[11px] opacity-70 mt-0.5">{checklistModalData.department}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
                Required Prerequisite Documents:
              </span>
              <ul className="space-y-2 text-xs">
                {checklistModalData.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-xl bg-gray-50 dark:bg-[#14231C] border border-gray-200 dark:border-gray-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[10px] opacity-60 italic leading-relaxed">
              Requirements may change. Always verify latest official guidelines and document
              specifications on the government portal before submitting.
            </p>

            <button
              onClick={() => {
                const srv = checklistModalData;
                setChecklistModalData(null);
                handleOpenExternal(srv.applyUrl || srv.officialUrl, srv.name);
              }}
              className="w-full py-2.5 bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPORT INCORRECT LINK                                            */}
      {/* ========================================================================= */}
      {reportLinkModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-[#101B16] border-[#1C3328] text-white' : 'bg-white border-[#E8E4DA]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm">Report Broken Government Link</h3>
              </div>
              <button
                onClick={() => setReportLinkModalData(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-200">
                  Thank you for reporting!
                </h4>
                <p className="text-[11px] opacity-75">
                  Our verification team will audit this link and update it with the official portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3 text-xs">
                <p className="opacity-80">
                  Reporting link for: <strong>{reportLinkModalData.name}</strong>
                </p>
                <div>
                  <label className="block font-bold text-[11px] mb-1 opacity-80">
                    What seems to be the issue?
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportFeedback}
                    onChange={(e) => setReportFeedback(e.target.value)}
                    placeholder="e.g. Website returning 404 error, domain changed, or slow response..."
                    className={`w-full p-2.5 rounded-xl border text-xs outline-hidden ${
                      isDarkMode
                        ? 'bg-[#14231C] border-[#22392E] text-white'
                        : 'bg-white border-[#D2CEBE]'
                    }`}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportLinkModalData(null)}
                    className="flex-1 py-2 rounded-xl border text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#063B2C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD APPLICATION TRACKER                                          */}
      {/* ========================================================================= */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#101B16] border-[#1C3328] text-white' : 'bg-white border-[#E8E4DA]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm">Save Application Record</h3>
              </div>
              <button
                onClick={() => setIsAddAppModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[11px] mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. Birth Certificate, Trade License, Caste..."
                  className={`w-full p-2.5 rounded-xl border outline-hidden ${
                    isDarkMode
                      ? 'bg-[#14231C] border-[#22392E] text-white'
                      : 'bg-white border-[#D2CEBE]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1">
                  Application / Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={newAppRef}
                  onChange={(e) => setNewAppRef(e.target.value)}
                  placeholder="e.g. WB-2024-XXXXX or Acknowledgement ID"
                  className={`w-full p-2.5 rounded-xl border outline-hidden font-mono ${
                    isDarkMode
                      ? 'bg-[#14231C] border-[#22392E] text-white'
                      : 'bg-white border-[#D2CEBE]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[11px] mb-1">Application Date</label>
                  <input
                    type="date"
                    value={newAppDate}
                    onChange={(e) => setNewAppDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${
                      isDarkMode
                        ? 'bg-[#14231C] border-[#22392E] text-white'
                        : 'bg-white border-[#D2CEBE]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[11px] mb-1">Current Status</label>
                  <select
                    value={newAppStatus}
                    onChange={(e) =>
                      setNewAppStatus(e.target.value as SavedGovtApplication['status'])
                    }
                    className={`w-full p-2.5 rounded-xl border outline-hidden ${
                      isDarkMode
                        ? 'bg-[#14231C] border-[#22392E] text-white'
                        : 'bg-white border-[#D2CEBE]'
                    }`}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Document Verification">Document Verification</option>
                    <option value="Approved">Approved</option>
                    <option value="Action Required">Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1">Official Portal URL</label>
                <input
                  type="url"
                  value={newAppPortal}
                  onChange={(e) => setNewAppPortal(e.target.value)}
                  placeholder="https://edistrict.wb.gov.in"
                  className={`w-full p-2.5 rounded-xl border outline-hidden font-mono ${
                    isDarkMode
                      ? 'bg-[#14231C] border-[#22392E] text-white'
                      : 'bg-white border-[#D2CEBE]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={newAppNotes}
                  onChange={(e) => setNewAppNotes(e.target.value)}
                  placeholder="e.g. Physical visit scheduled next Monday at BDO"
                  className={`w-full p-2.5 rounded-xl border outline-hidden ${
                    isDarkMode
                      ? 'bg-[#14231C] border-[#22392E] text-white'
                      : 'bg-white border-[#D2CEBE]'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAppModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#063B2C] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#084D3A] cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
