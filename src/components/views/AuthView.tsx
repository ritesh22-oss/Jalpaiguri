import React, { useState, useEffect } from 'react';
import { HandshakePinLogo } from '../common/HandshakePinLogo';
import {
  ChevronLeft,
  ChevronDown,
  User as UserIcon,
  Delete,
  ChevronUp,
  Check,
  Sparkles,
  Mail,
  Lock,
  Phone as PhoneIcon,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { BloodGroup, UserProfile } from '../../types';

export const AuthView: React.FC = () => {
  const {
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    signInWithPassword,
    signUpWithPassword,
    completeOnboarding,
    loginAsDemoCitizen,
    loginAsDemoAdmin,
    user
  } = useAuth();
  const { replaceView } = useNav();

  // Screen Step: 1 = 'signin', 2 = 'verify', 3 = 'complete-profile'
  const [step, setStep] = useState<'signin' | 'verify' | 'complete-profile'>('signin');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Google Account Chooser Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Step 1: Phone State
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [countryCode, setCountryCode] = useState('+91');

  // Email/Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupBloodGroup, setSignupBloodGroup] = useState<BloodGroup>('O+');
  const [signupLocation, setSignupLocation] = useState('Kadamtala, Jalpaiguri');

  // Step 2: Verify Phone OTP State (6 digits for standard Supabase SMS)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number>(0);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  // Step 3: Complete Profile State
  const [fullName, setFullName] = useState('Priya Sharma');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('A+');
  const [location, setLocation] = useState('Kadamtala, Jalpaiguri');

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Timer countdown for Step 2
  useEffect(() => {
    let interval: any;
    if (step === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle Google Login
  const handleGoogleSignIn = async (selectedEmail?: string, selectedName?: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle(selectedEmail || 'genzifystore39@gmail.com', selectedName);
      setLoading(false);
      setIsGoogleModalOpen(false);
      if (res?.success) {
        setSuccessMsg(res.message || 'Signed in with Google!');
        setTimeout(() => {
          replaceView('home');
        }, 500);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Google sign-in error. You can continue with Phone number.');
    }
  };

  // Handle Phone Sign In Continue
  const handlePhoneContinue = async () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const formattedPhone = `${countryCode}${cleanNumber}`;
      const res = await sendPhoneOtp(formattedPhone);
      setLoading(false);
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setFocusedOtpIndex(0);
      if (res.success) {
        setSuccessMsg(res.message || `Code sent to ${formattedPhone}`);
      } else {
        setErrorMsg(res.message || 'Could not send SMS. Please verify your Supabase SMS settings.');
      }
      setStep('verify');
    } catch (e: any) {
      setLoading(false);
      setStep('verify');
    }
  };

  // Handle Email Sign In or Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email and password');
      return;
    }

    setLoading(true);
    if (authMode === 'signin') {
      const res = await signInWithPassword(email, password);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          replaceView('home');
        }, 400);
      } else {
        setErrorMsg(res.message || 'Invalid email or password');
      }
    } else {
      if (!signupName.trim()) {
        setErrorMsg('Please enter your full name');
        setLoading(false);
        return;
      }
      const res = await signUpWithPassword({
        email,
        password,
        name: signupName,
        phone: phoneNumber,
        bloodGroup: signupBloodGroup,
        location: signupLocation,
        role: 'citizen'
      });
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          replaceView('home');
        }, 400);
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    }
  };

  // Keypad press handler for OTP Screen (supports 6 digits)
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      const newDigits = [...otpDigits];
      if (otpDigits[focusedOtpIndex]) {
        newDigits[focusedOtpIndex] = '';
        setOtpDigits(newDigits);
      } else if (focusedOtpIndex > 0) {
        newDigits[focusedOtpIndex - 1] = '';
        setOtpDigits(newDigits);
        setFocusedOtpIndex(focusedOtpIndex - 1);
      }
      return;
    }

    if (focusedOtpIndex < 6) {
      const newDigits = [...otpDigits];
      newDigits[focusedOtpIndex] = val;
      setOtpDigits(newDigits);

      if (focusedOtpIndex < 5) {
        setFocusedOtpIndex(focusedOtpIndex + 1);
      }
    }
  };

  // Resend OTP
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    setErrorMsg('');
    setSuccessMsg('');
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const res = await sendPhoneOtp(`${countryCode}${cleanNumber}`);
    setIsResending(false);
    setResendTimer(30);
    if (res.success) {
      setSuccessMsg(res.message || 'New OTP sent to your phone');
    } else {
      setErrorMsg(res.message || 'Failed to resend OTP');
    }
  };

  // Handle OTP Verification
  const handleVerify = async () => {
    const code = otpDigits.join('');
    if (!code || code.length < 4) {
      setErrorMsg('Please enter the OTP verification code');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await verifyPhoneOtp(code);
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Phone verified!');
      setStep('complete-profile');
    } else {
      setErrorMsg(res.message || 'Incorrect verification code. Please check your SMS.');
    }
  };

  // Handle Complete Profile Submission
  const handleProfileContinue = () => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    setErrorMsg('');
    completeOnboarding({
      name: fullName,
      age,
      gender,
      bloodGroup,
      location: location || 'Kadamtala, Jalpaiguri'
    });
    localStorage.setItem('jpg_has_onboarded', 'true');
    replaceView('home');
  };

  return (
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      {/* ========================================================================= */}
      {/* SCREEN 1: SIGN IN / SIGN UP                                              */}
      {/* ========================================================================= */}
      {step === 'signin' && (
        <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in duration-300">
          {/* Top Bar with Back Button & Center Title */}
          <div className="flex items-center justify-between relative py-2">
            <button
              onClick={() => replaceView('onboarding')}
              className="p-2 -ml-2 text-[#11241C] hover:opacity-70 cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h2 className="text-lg font-bold text-[#11241C] absolute left-1/2 -translate-x-1/2">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <div className="w-6"></div>
          </div>

          {/* Segmented control for Sign In / Sign Up */}
          <div className="flex p-1 bg-[#F1F5F9] rounded-xl my-1 mx-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#11241C] shadow-xs'
                  : 'text-[#64748B] hover:text-[#11241C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#11241C] shadow-xs'
                  : 'text-[#64748B] hover:text-[#11241C]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Center Brand Logo with Handshake + Pin */}
          <div className="flex flex-col items-center justify-center my-auto py-3">
            <div className="mb-3 transform hover:scale-105 transition-transform">
              <HandshakePinLogo size="xl" showText={true} />
            </div>

            {/* Method switcher: Phone OTP vs Email */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#64748B] mb-2">
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMethod === 'phone'
                    ? 'border-[#2563EB] text-[#2563EB] font-bold'
                    : 'border-transparent hover:text-[#11241C]'
                }`}
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                <span>Phone OTP</span>
              </button>
              <span className="text-[#CBD5E1]">|</span>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMethod === 'email'
                    ? 'border-[#2563EB] text-[#2563EB] font-bold'
                    : 'border-transparent hover:text-[#11241C]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>
            </div>

            {/* Notification / Error message if any */}
            {errorMsg && (
              <div className="mb-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-center w-full">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold text-center w-full">
                {successMsg}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="space-y-3.5 pb-2">
            {/* Continue with Google Button (Triggers Safe Google Account Modal) */}
            <button
              id="google-signin-btn"
              onClick={() => setIsGoogleModalOpen(true)}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
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
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#E2E8F0]"></div>
              <span className="bg-white px-3 text-xs font-semibold text-[#64748B] whitespace-nowrap">
                {authMethod === 'phone' ? 'or sign in with phone' : 'or sign in with email'}
              </span>
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>

            {/* PHONE METHOD */}
            {authMethod === 'phone' && (
              <div className="space-y-3">
                <div className="border border-[#CBD5E1] rounded-xl px-3.5 py-3 flex items-center gap-2.5 bg-white shadow-xs focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]">
                  <div className="flex items-center gap-1 text-sm font-bold text-[#1E293B] border-r border-[#CBD5E1] pr-2.5">
                    <span>{countryCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full text-sm font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
                  />
                </div>

                <button
                  id="phone-continue-btn"
                  onClick={handlePhoneContinue}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  {loading ? 'Sending Code...' : 'Continue'}
                </button>
              </div>
            )}

            {/* EMAIL METHOD */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-2.5">
                {authMode === 'signup' && (
                  <div className="border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 flex items-center gap-2 bg-white shadow-xs">
                    <UserIcon className="w-4 h-4 text-[#64748B] shrink-0" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full text-xs font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
                    />
                  </div>
                )}

                <div className="border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 flex items-center gap-2 bg-white shadow-xs">
                  <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full text-xs font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
                  />
                </div>

                <div className="border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 flex items-center gap-2 bg-white shadow-xs">
                  <Lock className="w-4 h-4 text-[#64748B] shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min. 6 chars)"
                    className="w-full text-xs font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-[#CBD5E1] rounded-xl px-3 py-2 bg-white">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase">Blood Group</label>
                      <select
                        value={signupBloodGroup}
                        onChange={(e) => setSignupBloodGroup(e.target.value as BloodGroup)}
                        className="w-full text-xs font-bold text-[#1E293B] bg-transparent focus:outline-none cursor-pointer"
                      >
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="border border-[#CBD5E1] rounded-xl px-3 py-2 bg-white">
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase">Locality / Ward</label>
                      <input
                        type="text"
                        value={signupLocation}
                        onChange={(e) => setSignupLocation(e.target.value)}
                        placeholder="e.g. Kadamtala"
                        className="w-full text-xs font-semibold text-[#1E293B] bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  {loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In with Email' : 'Create Citizen Account'}
                </button>
              </form>
            )}

            {/* Fast Quick Logins */}
            <div className="pt-2 flex items-center justify-center gap-3 text-xs">
              <button
                onClick={() => {
                  loginAsDemoCitizen();
                  replaceView('home');
                }}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Demo Citizen</span>
              </button>
              <span className="text-[#CBD5E1]">•</span>
              <button
                onClick={() => {
                  loginAsDemoAdmin();
                  replaceView('admin-dashboard');
                }}
                className="text-[#059669] font-bold hover:underline cursor-pointer"
              >
                Demo Admin
              </button>
              <span className="text-[#CBD5E1]">•</span>
              <button
                onClick={() => replaceView('home')}
                className="text-[#64748B] font-semibold hover:underline cursor-pointer"
              >
                Skip as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: VERIFY PHONE (4-Digit Bubbles + iOS Keypad)                     */}
      {/* ========================================================================= */}
      {step === 'verify' && (
        <div className="flex-1 flex flex-col justify-between py-4 animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between relative py-2">
            <button
              onClick={() => setStep('signin')}
              className="p-2 -ml-2 text-[#11241C] hover:opacity-70 cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h2 className="text-lg font-bold text-[#11241C] absolute left-1/2 -translate-x-1/2">
              Verify Phone
            </h2>
            <div className="w-6"></div>
          </div>

          {/* Subtitle & Instructions */}
          <div className="pt-2 pb-2 text-center space-y-1">
            <p className="text-xs font-semibold text-[#64748B]">
              Enter the verification code sent to
            </p>
            <p className="text-sm font-bold text-[#11241C]">
              {countryCode} {phoneNumber ? phoneNumber : '98765 43210'}
            </p>
          </div>

          {/* 6 Circular/Rounded OTP Input Bubbles + Hidden input for physical keyboard typing & autofill */}
          <div className="relative flex items-center justify-center gap-2.5 my-2">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              value={otpDigits.join('')}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                const newDigits = ['', '', '', '', '', ''];
                for (let i = 0; i < val.length; i++) {
                  newDigits[i] = val[i];
                }
                setOtpDigits(newDigits);
                setFocusedOtpIndex(Math.min(val.length, 5));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  handleKeypadPress('backspace');
                } else if (/^[0-9]$/.test(e.key)) {
                  handleKeypadPress(e.key);
                }
              }}
            />

            {[0, 1, 2, 3, 4, 5].map((index) => {
              const digit = otpDigits[index];
              const isFilled = Boolean(digit);
              const isFocused = focusedOtpIndex === index;

              return (
                <div
                  key={index}
                  onClick={() => setFocusedOtpIndex(index)}
                  className={`w-11 h-13 rounded-2xl flex items-center justify-center text-lg font-extrabold transition-all cursor-pointer ${
                    isFocused
                      ? 'border-2 border-[#2563EB] bg-white shadow-xs'
                      : isFilled
                      ? 'border-2 border-[#2563EB] bg-[#EFF6FF] text-[#1E293B]'
                      : 'border-2 border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                >
                  {isFilled ? (
                    <span>{digit}</span>
                  ) : isFocused ? (
                    <span className="w-0.5 h-5 bg-[#2563EB] animate-pulse"></span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Resend Timer Text */}
          <div className="text-center py-2">
            <p className="text-xs font-semibold text-[#64748B]">
              {resendTimer > 0 ? (
                <span>Resend code in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  {isResending ? 'Resending...' : 'Resend Code Now'}
                </button>
              )}
            </p>
          </div>

          {/* Error / Success message */}
          {errorMsg && (
            <p className="text-xs text-red-500 font-semibold text-center mb-1">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-xs text-emerald-600 font-semibold text-center mb-1">{successMsg}</p>
          )}

          {/* Verify Button */}
          <div className="px-1 mb-3">
            <button
              id="verify-btn"
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {/* iOS-Style Custom Numeric Keypad */}
          <div className="bg-[#F1F5F9]/80 rounded-3xl p-3 pt-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { num: '1', letters: '' },
                { num: '2', letters: 'ABC' },
                { num: '3', letters: 'DEF' },
                { num: '4', letters: 'GHI' },
                { num: '5', letters: 'JKL' },
                { num: '6', letters: 'MNO' },
                { num: '7', letters: 'PQRS' },
                { num: '8', letters: 'TUV' },
                { num: '9', letters: 'WXYZ' }
              ].map((k) => (
                <button
                  key={k.num}
                  type="button"
                  onClick={() => handleKeypadPress(k.num)}
                  className="h-11 bg-white rounded-xl shadow-xs flex flex-col items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-base font-bold text-[#1E293B] leading-none">{k.num}</span>
                  {k.letters && (
                    <span className="text-[8px] font-extrabold text-[#64748B] tracking-wider leading-none mt-0.5">
                      {k.letters}
                    </span>
                  )}
                </button>
              ))}

              <div className="h-11 flex items-center justify-center"></div>

              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-11 bg-white rounded-xl shadow-xs flex flex-col items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-base font-bold text-[#1E293B]">0</span>
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="h-11 bg-transparent rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#1E293B] active:scale-95 transition-all cursor-pointer"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: COMPLETE PROFILE                                               */}
      {/* ========================================================================= */}
      {step === 'complete-profile' && (
        <div className="flex-1 flex flex-col justify-between py-4 animate-in fade-in duration-300">
          {/* Top Bar with Title & Right Avatar Icon */}
          <div className="flex items-center justify-between relative py-2">
            <div className="w-8"></div>
            <h2 className="text-lg font-bold text-[#11241C] absolute left-1/2 -translate-x-1/2">
              Complete Profile
            </h2>
            <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#64748B]">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-4 my-auto">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Full Name *
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Priya Sharma"
                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none shadow-xs"
              />
            </div>

            {/* Age with Stepper */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Age
              </label>
              <div className="relative flex items-center">
                <input
                  id="profile-age"
                  type="number"
                  min={10}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  placeholder="e.g., 28"
                  className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none shadow-xs pr-10"
                />
                <div className="absolute right-2 flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setAge((prev) => Math.min(100, prev + 1))}
                    className="p-0.5 text-[#64748B] hover:text-[#1E293B]"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAge((prev) => Math.max(10, prev - 1))}
                    className="p-0.5 text-[#64748B] hover:text-[#1E293B]"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Gender Segmented Tabs: [ Male ] [ Female ] [ Other ] */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                {(['Male', 'Female', 'Other'] as const).map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#1E293B]'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blood Group Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Blood Group
              </label>
              <div className="relative">
                <select
                  id="profile-blood"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm font-semibold text-[#1E293B] bg-white focus:border-[#2563EB] focus:outline-none shadow-xs appearance-none cursor-pointer"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Locality / Ward */}
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                Locality / Ward (Jalpaiguri)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kadamtala, Jalpaiguri"
                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm font-semibold text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <p className="text-xs text-red-500 font-semibold text-center mb-2">{errorMsg}</p>
          )}

          {/* Continue Button */}
          <div className="pt-4 pb-2">
            <button
              id="profile-continue-btn"
              onClick={handleProfileContinue}
              className="w-full py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Continue to Jalpaiguri Connect
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GOOGLE ACCOUNT SELECTION MODAL                                            */}
      {/* ========================================================================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
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
                <h3 className="font-bold text-sm text-[#11241C]">Sign in with Google</h3>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#11241C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Choose an account to continue to <strong>Jalpaiguri Connect</strong>:
            </p>

            {/* Primary account */}
            <div className="space-y-2">
              <button
                onClick={() => handleGoogleSignIn('genzifystore39@gmail.com', 'Genzify Citizen')}
                className="w-full p-3 rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all flex items-center gap-3 text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-sm shrink-0">
                  G
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#11241C]">Genzify Store</div>
                  <div className="text-[11px] text-[#64748B] truncate">genzifystore39@gmail.com</div>
                </div>
                <Check className="w-4 h-4 text-[#2563EB]" />
              </button>

              <button
                onClick={() => handleGoogleSignIn('priya.sharma.jal@gmail.com', 'Priya Sharma')}
                className="w-full p-3 rounded-2xl border border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all flex items-center gap-3 text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#059669] text-white font-bold flex items-center justify-center text-sm shrink-0">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#11241C]">Priya Sharma</div>
                  <div className="text-[11px] text-[#64748B] truncate">priya.sharma.jal@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google Email input */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">
                Or sign in with another Google email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="flex-1 border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.includes('@')) {
                      handleGoogleSignIn(customGoogleEmail);
                    }
                  }}
                  className="px-3 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Go
                </button>
              </div>
            </div>

            <p className="text-[10px] text-[#94A3B8] text-center pt-1">
              Protected by Jalpaiguri Connect Secure Citizen Verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
