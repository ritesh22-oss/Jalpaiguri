import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Lock
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { CivicCategory, CivicReport, CivicSeverity } from '../../types';
import { ReportCategorySelector } from '../report/ReportCategorySelector';
import { ReportMediaUploader } from '../report/ReportMediaUploader';
import { ReportLocationSection, ReportLocationData } from '../report/ReportLocationSection';
import { ReportDescriptionSection } from '../report/ReportDescriptionSection';
import { ReportAdditionalDetails } from '../report/ReportAdditionalDetails';
import { ReportAiAssistModal } from '../report/ReportAiAssistModal';
import { ReportSuccessScreen } from '../report/ReportSuccessScreen';
import { MyReportsList } from '../report/MyReportsList';
import { ReportDetailsModal } from '../report/ReportDetailsModal';
import { validateServiceArea } from '../../utils/serviceArea';

export const ReportProblemView: React.FC = () => {
  const { goBack, navigate, activeParams } = useNav();
  const { submitCivicReport, civicReports } = useApp();
  const { user } = useAuth();
  const { location: gpsLocation } = useLocation();

  // Active top-level view tab: 'form' | 'my-reports'
  const [activeTab, setActiveTab] = useState<'form' | 'my-reports'>('form');

  // Form states
  const [category, setCategory] = useState<CivicCategory>('Road');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  // Initialize location strictly with valid fallback
  const initialLat = gpsLocation?.lat || 26.5228;
  const initialLng = gpsLocation?.lng || 88.7245;
  const initialAreaCheck = validateServiceArea(initialLat, initialLng);

  const [locationData, setLocationData] = useState<ReportLocationData>({
    formattedAddress: gpsLocation?.road ? `${gpsLocation.road}, ${gpsLocation.locality}` : (gpsLocation?.name ? `${gpsLocation.name}, Jalpaiguri` : 'Kadamtala, Jalpaiguri, WB - 735101'),
    locality: gpsLocation?.locality || gpsLocation?.name || 'Kadamtala',
    city: 'Jalpaiguri',
    district: 'Jalpaiguri',
    state: 'West Bengal',
    lat: initialLat,
    lng: initialLng,
    accuracy: gpsLocation?.accuracy ? Math.round(gpsLocation.accuracy) : undefined,
    isGps: Boolean(gpsLocation && gpsLocation.locationSource === 'gps'),
    isInsideJalpaiguri: initialAreaCheck.isInside
  });

  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [noticedWhen, setNoticedWhen] = useState('Just now');
  const [severity, setSeverity] = useState<CivicSeverity>('Medium');
  const [isAiAssisted, setIsAiAssisted] = useState(false);

  // Modals and submission state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CivicReport | null>(null);
  const [selectedReportDetails, setSelectedReportDetails] = useState<CivicReport | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if navigation params requested tracking a specific report
  useEffect(() => {
    if (activeParams?.reportId) {
      const match = civicReports.find((r) => r.id === activeParams.reportId);
      if (match) {
        setSelectedReportDetails(match);
        setActiveTab('my-reports');
      }
    }
  }, [activeParams, civicReports]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const charCount = description.trim().length;
    if (charCount < 15) {
      setValidationError('Please provide a detailed description of at least 15 characters.');
      return;
    }

    if (!locationData.isInsideJalpaiguri) {
      setValidationError('Civic reporting is currently available only for locations within Jalpaiguri. Please select a Jalpaiguri ward or locality.');
      return;
    }

    setIsSubmitting(true);

    try {
      const report = await submitCivicReport({
        category,
        location: locationData.formattedAddress,
        locality: locationData.locality,
        city: locationData.city,
        district: locationData.district,
        state: locationData.state,
        lat: locationData.lat,
        lng: locationData.lng,
        accuracy: locationData.accuracy,
        description: description.trim(),
        photoUrl: mediaUrl || undefined,
        videoUrl: mediaType === 'video' ? mediaUrl || undefined : undefined,
        mediaType: mediaType || undefined,
        landmark: landmark.trim() || undefined,
        noticedWhen,
        severity,
        aiAssisted: isAiAssisted,
        userId: user?.id
      });

      setIsSubmitting(false);
      setSubmittedReport(report);
    } catch (err: any) {
      setIsSubmitting(false);
      setValidationError(err?.message || 'Failed to submit report. Please check your connection and try again.');
    }
  };

  const resetForm = () => {
    setCategory('Road');
    setMediaUrl(null);
    setMediaType(null);
    setDescription('');
    setLandmark('');
    setNoticedWhen('Just now');
    setSeverity('Medium');
    setIsAiAssisted(false);
    setValidationError(null);
    setSubmittedReport(null);
  };

  // If a report was just submitted, render the success screen
  if (submittedReport) {
    return (
      <ReportSuccessScreen
        report={submittedReport}
        onTrackStatus={() => {
          setSelectedReportDetails(submittedReport);
          setActiveTab('my-reports');
          setSubmittedReport(null);
        }}
        onReportAnother={resetForm}
        onGoHome={() => navigate('home')}
      />
    );
  }

  const isFormValid = description.trim().length >= 15 && locationData.isInsideJalpaiguri;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-32 max-w-md mx-auto select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0F1A15]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#16241F] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>

            <div>
              <h1 className="text-base font-extrabold text-[#11241C] dark:text-white tracking-tight">
                Report a Problem
              </h1>
              <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                Jalpaiguri Municipal Grievance Portal
              </p>
            </div>
          </div>

          {/* Quick tab switcher pill */}
          <div className="flex items-center gap-1 bg-[#EAE6DB] dark:bg-[#16241F] p-1 rounded-xl border border-[#D2CEBE]/50 dark:border-white/10">
            <button
              type="button"
              id="tab-btn-report"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white dark:bg-emerald-600 text-[#063B2C] dark:text-white shadow-xs'
                  : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white'
              }`}
            >
              Report
            </button>
            <button
              type="button"
              id="tab-btn-my-reports"
              onClick={() => setActiveTab('my-reports')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my-reports'
                  ? 'bg-white dark:bg-emerald-600 text-[#063B2C] dark:text-white shadow-xs'
                  : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white'
              }`}
            >
              <span>Track</span>
              <span className="w-4 h-4 rounded-full bg-[#063B2C]/10 dark:bg-white/20 text-[#063B2C] dark:text-white text-[10px] flex items-center justify-center font-bold">
                {civicReports.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-6">
        {activeTab === 'my-reports' ? (
          /* Track & My Reports Section */
          <div className="space-y-4">
            <div className="pt-1 pb-1">
              <h2 className="text-xl font-black text-[#11241C] dark:text-white tracking-tight">
                Civic Issue Tracker
              </h2>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-0.5">
                Real-time status updates from Jalpaiguri Municipal Corporation wards
              </p>
            </div>

            <MyReportsList
              reports={civicReports}
              onSelectReport={(report) => setSelectedReportDetails(report)}
              onNewReport={() => setActiveTab('form')}
            />
          </div>
        ) : (
          /* Report Submission Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hero Section */}
            <div className="text-center pt-2 pb-1 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-[#063B2C] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <Building2 className="w-6 h-6 stroke-[1.8]" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#063B2C] dark:text-emerald-400 tracking-tight">
                  What needs fixing?
                </h2>
                <p className="text-xs sm:text-sm text-[#55685F] dark:text-[#A2B3AA] mt-1 max-w-[320px] mx-auto leading-relaxed">
                  Help us improve Jalpaiguri by reporting local civic issues directly to municipal teams.
                </p>
              </div>
            </div>

            {/* Validation alert banner */}
            {validationError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="flex-1">
                  <p className="font-bold">Submission Notice</p>
                  <p className="text-[11px] mt-0.5 opacity-90">{validationError}</p>
                </div>
              </div>
            )}

            {/* 1. Category Selection */}
            <ReportCategorySelector
              selectedCategory={category}
              onSelectCategory={(cat) => setCategory(cat)}
            />

            {/* 2. Photo / Video Evidence */}
            <ReportMediaUploader
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              onMediaSelected={(url, type) => {
                setMediaUrl(url);
                setMediaType(type);
              }}
            />

            {/* 3. Location (with GPS & Jalpaiguri-only verification) */}
            <ReportLocationSection
              locationData={locationData}
              onChangeLocation={(newData) => {
                setLocationData(newData);
                if (validationError) setValidationError(null);
              }}
            />

            {/* 4. Description with AI Assist trigger */}
            <ReportDescriptionSection
              description={description}
              onChangeDescription={(val) => {
                setDescription(val);
                if (validationError) setValidationError(null);
              }}
              category={category}
              isAiAssisted={isAiAssisted}
              onOpenAiAssist={() => setIsAiModalOpen(true)}
            />

            {/* 5. Additional Optional Details (Landmark, when noticed, severity) */}
            <ReportAdditionalDetails
              landmark={landmark}
              onChangeLandmark={(val) => setLandmark(val)}
              noticedWhen={noticedWhen}
              onChangeNoticedWhen={(val) => setNoticedWhen(val)}
              severity={severity}
              onChangeSeverity={(val) => setSeverity(val)}
            />

            {/* Privacy Compliance Banner */}
            <div className="p-3 bg-white dark:bg-[#16241F] rounded-2xl border border-[#E4DFD3] dark:border-white/10 flex items-start gap-2.5 text-[11px] text-[#55685F] dark:text-[#A2B3AA] leading-relaxed shadow-xs">
              <Lock className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#11241C] dark:text-white">Privacy Protected: </span>
                Your report information is shared only with authorized municipal systems or personnel responsible for handling the reported civic issue.
              </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-t border-[#E8E4DA]/70 dark:border-white/10">
              <div className="max-w-md mx-auto">
                <button
                  type="submit"
                  id="btn-submit-civic-report"
                  disabled={isSubmitting || !isFormValid}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    isFormValid && !isSubmitting
                      ? 'bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] dark:hover:bg-emerald-700 text-white active:scale-98'
                      : 'bg-[#D2CEBE] dark:bg-gray-700 text-white cursor-not-allowed opacity-75'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Report to Municipality…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2.2]" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>

                {!isFormValid && (
                  <p className="text-[10px] text-center text-[#8C9B93] dark:text-[#A2B3AA] mt-1.5 font-medium">
                    {!locationData.isInsideJalpaiguri
                      ? 'Location must be within Jalpaiguri service area'
                      : description.trim().length < 15
                      ? `Add ${15 - description.trim().length} more characters to description`
                      : 'Complete required fields to submit'}
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* AI Enhancement Modal */}
      <ReportAiAssistModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        originalDescription={description}
        category={category}
        location={locationData.formattedAddress}
        onApplyEnhancement={(enhancedText, suggestedCat) => {
          setDescription(enhancedText);
          setIsAiAssisted(true);
          if (suggestedCat) setCategory(suggestedCat);
        }}
      />

      {/* Detailed Report View Modal */}
      <ReportDetailsModal
        report={selectedReportDetails}
        onClose={() => setSelectedReportDetails(null)}
      />
    </div>
  );
};
