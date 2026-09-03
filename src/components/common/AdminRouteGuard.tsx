import React from 'react';
import { ShieldAlert, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useNav } from '../../context/NavigationContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminRouteGuard:
 * Middleware wrapper component that strictly restricts access to administrative views
 * to the single designated municipal administrator.
 */
export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children, fallback }) => {
  const { navigate } = useNav();
  const {
    isAuthorized,
    isLoading,
    currentEmail,
    denialReason,
    error,
    loginAsAdmin
  } = useAdminGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#063B2C] flex flex-col items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-xs text-emerald-200/90 font-medium">
            Verifying municipal administrative credentials...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Restricted Access Barrier
  return (
    <div className="min-h-screen bg-[#063B2C] text-white flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#042A1F] border border-[#0F5A43] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800 mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Administration Zone</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Municipal Admin Access
        </h1>

        <p className="text-xs text-emerald-200/80 leading-relaxed mb-6">
          Access to the Jalpaiguri Municipal Administration Console is restricted exclusively to authorized municipal officers.
        </p>

        {currentEmail ? (
          <div className="w-full bg-rose-950/40 border border-rose-900/60 rounded-2xl p-3.5 mb-6 text-left">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
              Connected Account
            </span>
            <p className="text-xs text-rose-200 font-medium break-all mt-0.5">
              {currentEmail}
            </p>
            <span className="text-[10px] text-rose-300/90 mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{denialReason || 'Account not permitted to access administrative functions.'}</span>
            </span>
          </div>
        ) : (
          <div className="w-full bg-[#06382A] border border-[#0F5A43] rounded-2xl p-3.5 mb-6 text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Official Sign-In Required
            </span>
            <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
              Please authenticate using your municipal administration Google credentials to proceed.
            </p>
          </div>
        )}

        {error && (
          <div className="w-full bg-rose-500/20 border border-rose-500/40 rounded-xl p-2.5 mb-4 text-xs text-rose-200 text-left">
            {error}
          </div>
        )}

        <div className="w-full space-y-3">
          <button
            onClick={() => loginAsAdmin()}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-emerald-50 active:scale-98 text-[#063B2C] font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
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
            <span>Verify Municipal Google SSO</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Citizen Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
