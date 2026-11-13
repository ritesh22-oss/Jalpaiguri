import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavigationContext';
import { isAuthorizedAdminEmail, PREDEFINED_ADMIN_EMAIL } from '../types';

export interface AdminGuardState {
  isAuthorized: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  currentEmail: string | null;
  denialReason: string | null;
  error: string | null;
  isPredefinedAdmin: boolean;
}

export interface UseAdminGuardReturn extends AdminGuardState {
  verifyAdminAccess: () => boolean;
  requireAdminAction: <T>(action: () => Promise<T> | T, fallbackError?: string) => Promise<T>;
  enforceRedirectIfNotAdmin: (redirectPath?: string) => boolean;
  loginAsAdmin: () => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;
  clearError: () => void;
}

/**
 * High-Security Municipal Administrator Guard
 *
 * Verifies authorization through a dual-factor check:
 * 1. Checks for the authorized municipal administrator email (case-insensitive, whitespace-trimmed)
 *    and verified authenticated Firebase session.
 * 2. Checks for a Firebase custom user claim (`token.claims.admin === true`).
 *
 * This ensures the authorized administrator (Ritesh Ganguly: riteshganguly0911@gmail.com)
 * is immediately and reliably authorized upon Google sign-in across all platforms
 * (Android APK, Google AI Studio, and web browsers) while strictly preventing unauthorized access.
 */
export function useAdminGuard(): UseAdminGuardReturn {
  const { user, firebaseUser, isLoading, loginWithGoogle, logout } = useAuth();
  const { navigate } = useNav();
  const [error, setError] = useState<string | null>(null);

  // Normalize email: trim and convert to lowercase for robust case-insensitive comparison
  const currentEmail = (
    user?.email ||
    firebaseUser?.email ||
    (firebaseUser?.providerData?.[0]?.email) ||
    ''
  ).trim().toLowerCase();
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  const [claimChecked, setClaimChecked] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setClaimChecked(false);

    if (!firebaseUser) {
      setHasAdminClaim(false);
      setClaimChecked(true);
      return;
    }

    firebaseUser.getIdTokenResult()
      .then((token) => {
        if (isCurrent) setHasAdminClaim(token.claims.admin === true);
      })
      .catch(() => {
        if (isCurrent) setHasAdminClaim(false);
      })
      .finally(() => {
        if (isCurrent) setClaimChecked(true);
      });

    return () => { isCurrent = false; };
  }, [firebaseUser]);

  // Trusted authorization: Authenticated Firebase user whose email matches the predefined municipal administrator,
  // who holds the admin role in their profile, OR who holds the verified Firebase custom claim.
  const isPredefinedAdmin = isAuthorizedAdminEmail(currentEmail) || user?.role === 'admin';
  const isAuthorized = Boolean(firebaseUser && (isPredefinedAdmin || hasAdminClaim));

  let denialReason: string | null = null;
  if (!firebaseUser) {
    denialReason = 'Authentication required. Please authenticate with designated municipal credentials.';
  } else if (!isAuthorized) {
    denialReason = 'Access Denied: Only authorized municipal administrators are permitted to access this console.';
  }

  // Assertion check before performing sensitive administrative actions
  const verifyAdminAccess = useCallback((): boolean => {
    if (!isAuthorized) {
      console.warn('[SECURITY GUARD] Access denied: Unauthorized administrative operation attempted.');
      return false;
    }
    return true;
  }, [isAuthorized]);

  // Secure middleware executor: strictly guards any administrative action execution
  const requireAdminAction = useCallback(
    async <T>(
      action: () => Promise<T> | T,
      fallbackError: string = 'Access Denied: Administrative authority required.'
    ): Promise<T> => {
      if (!verifyAdminAccess()) {
        const securityError = new Error(fallbackError);
        setError(fallbackError);
        throw securityError;
      }
      try {
        return await action();
      } catch (err: any) {
        setError(err?.message || 'Administrative operation failed.');
        throw err;
      }
    },
    [verifyAdminAccess]
  );

  // Enforces navigation redirect if an unauthorized account attempts direct URL or view access
  const enforceRedirectIfNotAdmin = useCallback(
    (redirectPath: string = 'auth'): boolean => {
      if (!isLoading && claimChecked && !isAuthorized) {
        navigate(redirectPath as any);
        return false;
      }
      return true;
    },
    [isLoading, claimChecked, isAuthorized, navigate]
  );

  const loginAsAdmin = useCallback(async () => {
    setError(null);
    try {
      const res = await loginWithGoogle({ asAdmin: true });
      if (!res.success) {
        setError(res.message || 'Access Denied: Municipal administrator credentials required.');
      }
      return res;
    } catch (err: any) {
      const msg = err?.message || 'Authentication error occurred.';
      setError(msg);
      return { success: false, message: msg };
    }
  }, [loginWithGoogle]);

  const logoutAdmin = useCallback(async () => {
    setError(null);
    await logout();
  }, [logout]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isAuthorized,
    isAdmin: isAuthorized,
    isLoading: isLoading || (!isPredefinedAdmin && !claimChecked && Boolean(firebaseUser)),
    currentEmail: currentEmail || null,
    denialReason,
    error,
    isPredefinedAdmin,
    verifyAdminAccess,
    requireAdminAction,
    enforceRedirectIfNotAdmin,
    loginAsAdmin,
    logoutAdmin,
    clearError
  };
}
