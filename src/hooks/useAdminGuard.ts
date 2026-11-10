import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavigationContext';

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
 * Client-side gating mirrors the Firebase custom claim checked by Firestore rules. The claim is
 * issued only by a trusted Admin SDK environment; a profile document or local storage can never
 * grant administrative access.
 */
export function useAdminGuard(): UseAdminGuardReturn {
  const { user, firebaseUser, isLoading, loginWithGoogle, logout } = useAuth();
  const { navigate } = useNav();
  const [error, setError] = useState<string | null>(null);

  const currentEmail = (user?.email || firebaseUser?.email || '').trim().toLowerCase();
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

  const isPredefinedAdmin = hasAdminClaim;
  const isAuthorized = Boolean(firebaseUser && hasAdminClaim);

  let denialReason: string | null = null;
  if (!firebaseUser) {
    denialReason = 'Authentication required. Please authenticate with designated municipal credentials.';
  } else if (!isAuthorized) {
    denialReason = 'Access Denied: This account does not have the required municipal administrator claim.';
  }

  // Assertion check before performing sensitive administrative actions
  const verifyAdminAccess = useCallback((): boolean => {
    if (!isAuthorized) {
      console.warn('[SECURITY GUARD] Access denied: unauthorized administrative operation attempted.');
      return false;
    }
    return true;
  }, [isAuthorized, currentEmail]);

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
      if (!isLoading && !isAuthorized) {
        navigate(redirectPath as any);
        return false;
      }
      return true;
    },
    [isLoading, isAuthorized, navigate]
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
    isLoading: isLoading || !claimChecked,
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
