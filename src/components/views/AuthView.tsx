import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lock,
  UserCheck,
  RotateCcw,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { HandshakePinLogo } from '../common/HandshakePinLogo';
import { FingerprintScannerModal } from '../common/FingerprintScannerModal';
import { isAuthorizedAdminEmail } from '../../types';
import { EnrolledFingerprint } from '../../lib/biometrics';

export const AuthView: React.FC = () => {
  const {
    loginWithGoogle,
    enrolledFingerprint,
    registerWithFingerprint,
    loginWithFingerprint,
    removeFingerprint,
    refreshEnrolledFingerprint
  } = useAuth();
  const { navigate, replaceView } = useNav();

  // Tab: 'citizen' | 'admin'
  const [authMode, setAuthMode] = useState<'citizen' | 'admin'>('citizen');

  // Citizen biometric registration form state
  const [citizenName, setCitizenName] = useState('');
  const [citizenLocation, setCitizenLocation] = useState('Kadamtala, Jalpaiguri');

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'enroll' | 'verify'>('enroll');

  // Loading & Alert states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Google Sign-In for all users / Admin
  const handleGoogleClick = async (isAdminAttempt: boolean = false) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithGoogle({ asAdmin: isAdminAttempt });
      setLoading(false);

      if (res.success) {
        if (isAdminAttempt && res.isAdmin) {
          setSuccessMsg('Welcome Administrator! Municipal authority credentials verified.');
          setTimeout(() => {
            navigate('admin-dashboard');
          }, 600);
        } else if (isAdminAttempt && !res.isAdmin) {
          setErrorMsg(
            res.message ||
              'Access Denied: Only verified municipal administrators can access the Admin portal. You have been connected with citizen privileges.'
          );
        } else {
          setSuccessMsg(res.isNewUser ? 'Welcome to Jalpaiguri Connect!' : 'Welcome back!');
          setTimeout(() => {
            if (res.isNewUser) {
              replaceView('profile-setup');
            } else {
              replaceView('home');
            }
          }, 500);
        }
      } else {
        if (res.message) {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Google sign-in could not be completed. Please try again.');
    }
  };

  // 2. Trigger Fingerprint Enrollment
  const handleStartFingerprintSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim()) {
      setErrorMsg('Please enter your full name to enroll your biometric fingerprint.');
      return;
    }
    setErrorMsg('');
    setScannerMode('enroll');
    setScannerOpen(true);
  };

  // 3. Trigger Fingerprint Verification / Login
  const handleStartFingerprintLogin = () => {
    setErrorMsg('');
    setScannerMode('verify');
    setScannerOpen(true);
  };

  // Callback from scanner modal upon successful biometric scan
  const handleScannerSuccess = async (enrolled: EnrolledFingerprint) => {
    if (scannerMode === 'enroll') {
      const res = await registerWithFingerprint(enrolled.userName, citizenLocation);
      if (res.success) {
        setSuccessMsg(`Biometric Key Enrolled! Locked exclusively to ${enrolled.userName}.`);
        setTimeout(() => {
          replaceView('home');
        }, 700);
      } else {
        setErrorMsg(res.message || 'Enrollment registration failed.');
      }
    } else {
      const res = await loginWithFingerprint(enrolled.fingerprintSignature);
      if (res.success) {
        setSuccessMsg(`Biometric Verified! Welcome back, ${enrolled.userName}.`);
        setTimeout(() => {
          replaceView('home');
        }, 700);
      } else {
        setErrorMsg(res.message || 'Fingerprint verification failed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#11241C] flex flex-col justify-between p-4 max-w-md mx-auto select-none relative shadow-2xl">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between pt-2 pb-1">
        <button
          onClick={() => navigate('onboarding')}
          className="p-1.5 -ml-1 text-gray-700 hover:text-black active:scale-95 transition-all cursor-pointer rounded-full hover:bg-gray-100"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
          Authentication & Access
        </h1>

        <div className="w-8"></div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-1 my-auto flex flex-col items-center">
        {/* Brand Logo */}
        <div className="my-4 flex items-center justify-center">
          <HandshakePinLogo size="md" showText={true} />
        </div>

        {/* Mode Selector Tabs: Citizen Access vs Login as Admin */}
        <div className="w-full grid grid-cols-2 p-1 bg-[#ECE8DF] rounded-2xl mb-4">
          <button
            type="button"
            id="tab-citizen-access"
            onClick={() => {
              setAuthMode('citizen');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'citizen'
                ? 'bg-white text-[#11241C] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-[#063B2C]" />
            <span>Citizen Access</span>
          </button>

          <button
            type="button"
            id="tab-admin-access"
            onClick={() => {
              setAuthMode('admin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'admin'
                ? 'bg-[#063B2C] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login as Admin</span>
          </button>
        </div>

        {/* Status Alerts */}
        <div className="w-full space-y-2 mb-3">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2.5 font-bold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs leading-snug">{successMsg}</p>
            </div>
          )}
        </div>

        {/* ----------------- TAB 1: CITIZEN ACCESS ----------------- */}
        {authMode === 'citizen' && (
          <div className="w-full space-y-4 animate-in fade-in duration-150">
            {/* 1. Google Auth for Every User */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Universal Google Sign-In
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Every citizen can sign in immediately using their personal Google account.
              </p>

              <button
                id="btn-google-auth"
                onClick={() => handleGoogleClick(false)}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-98 text-white font-semibold text-sm flex items-center justify-center relative shadow-xs transition-all cursor-pointer disabled:opacity-70 px-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="font-semibold text-white">Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute left-3 w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-2xs shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-white tracking-normal">
                      Continue with Google
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-gray-300"></div>
              <span className="shrink mx-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                or Biometric Privacy
              </span>
              <div className="grow border-t border-gray-300"></div>
            </div>

            {/* 2. Fingerprint Sign Up & Biometric Login Section */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E6F4EA] flex items-center justify-center text-[#063B2C]">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#11241C]">
                      Fingerprint Biometrics
                    </h3>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      Hardware Bound • Strict Privacy
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  {enrolledFingerprint ? 'Enrolled' : 'Ready'}
                </span>
              </div>

              {/* Strict Privacy Guarantee Description */}
              <div className="bg-[#FAF8F5] rounded-xl p-2.5 text-[11px] text-gray-600 border border-[#E8E4DA] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-[#063B2C] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Once your fingerprint is scanned, it is cryptographically locked to this device. No
                  one can log in with a different fingerprint.
                </p>
              </div>

              {/* If Fingerprint is ALREADY enrolled on device */}
              {enrolledFingerprint ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                        Registered Citizen
                      </span>
                      <p className="text-sm font-black text-gray-900">
                        {enrolledFingerprint.userName}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        Device Key: {enrolledFingerprint.credentialId.slice(0, 16)}...
                      </span>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  </div>

                  {/* Primary Login Button with Enrolled Fingerprint */}
                  <button
                    id="btn-login-with-fingerprint"
                    onClick={handleStartFingerprintLogin}
                    className="w-full h-12 rounded-xl bg-[#063B2C] hover:bg-[#084D3A] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-5 h-5 text-emerald-300" />
                    <span>Touch Sensor to Login</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        removeFingerprint();
                        setSuccessMsg('Enrolled fingerprint cleared from this device.');
                      }}
                      className="text-[11px] text-gray-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Re-enroll New Fingerprint</span>
                    </button>
                    <span className="text-[10px] text-gray-400">
                      Enrolled on {new Date(enrolledFingerprint.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                /* If NO Fingerprint is enrolled yet: Sign Up with Fingerprint */
                <form onSubmit={handleStartFingerprintSignUp} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Citizen Full Name
                    </label>
                    <input
                      id="input-citizen-name"
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder="e.g. Sourav Sengupta"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#063B2C] focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    id="btn-signup-with-fingerprint"
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#063B2C] hover:bg-[#084D3A] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-5 h-5 text-emerald-300" />
                    <span>Sign Up with Fingerprint</span>
                  </button>
                </form>
              )}
            </div>

            {/* Retired Phone Auth Notice */}
            <div className="text-center pt-1">
              <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                Phone OTP authentication has been replaced with biometric privacy.
              </span>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: LOGIN AS ADMIN ----------------- */}
        {authMode === 'admin' && (
          <div className="w-full space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#063B2C] text-white rounded-3xl p-5 shadow-lg border border-[#084D3A] space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#0F4F3C] border border-[#17664E] flex items-center justify-center text-emerald-300 shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="px-3 py-1 rounded-full bg-[#114637] border border-[#1E5D4B] text-[10px] font-extrabold tracking-wide uppercase text-emerald-300">
                  Municipal Portal
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Jalpaiguri Municipal Administration
                </h2>
                <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                  Administrative console for grievance dispatch, civic worker verification, and city alerts.
                </p>
              </div>

              {/* Strict Security Enforcement Card */}
              <div className="bg-[#03231A] rounded-2xl p-4 border border-[#114637] space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Municipal Officer Identity Gateway</span>
                </div>
                <div className="text-[11px] text-emerald-100/85 leading-relaxed space-y-1.5">
                  <p className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Designated single sign-on for verified municipal authority personnel.</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-emerald-200/75 text-[10px]">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Administrative privileges are granted solely to verified municipality staff. Standard accounts receive citizen access.</span>
                  </p>
                </div>
              </div>

              {/* Authenticate Admin via Google Button */}
              <button
                id="btn-admin-google-auth"
                onClick={() => handleGoogleClick(true)}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-white hover:bg-emerald-50 active:scale-98 text-[#063B2C] font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#063B2C]" />
                    <span className="font-bold">Verifying Admin Credentials...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Authenticate as Admin with Google</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setAuthMode('citizen')}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer underline underline-offset-2"
              >
                Not an admin? Return to Citizen Access
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Biometric Scanner Modal */}
      <FingerprintScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        mode={scannerMode}
        userName={citizenName || enrolledFingerprint?.userName}
        enrolledUser={enrolledFingerprint}
        onSuccess={handleScannerSuccess}
        onError={(msg) => setErrorMsg(msg)}
      />

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-3">
        <div className="w-32 h-1 bg-black/40 rounded-full"></div>
      </div>
    </div>
  );
};
