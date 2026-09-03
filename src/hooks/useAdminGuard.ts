import { useState, useCallback } from 'react';
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
 * Secure Administrative Hook & Middleware Guard
 * Strictly restricts administrative access to the single predefined municipal administrator email.
 * Ensures no other accounts can access the Admin Dashboard or execute municipal actions.
 */
export function useAdminGuard(): UseAdminGuardReturn {
  const { user, firebaseUser, isLoading, loginWithGoogle, logout } = useAuth();
  const { navigate } = useNav();
  const [error, setError] = useState<string | null>(null);

  const currentEmail = (user?.email || firebaseUser?.email || '').trim().toLowerCase();
  
  // Strict matching against single predefined administrator email
  const isPredefinedAdmin = currentEmail === PREDEFINED_ADMIN_EMAIL.toLowerCase();
  const isAuthorized = Boolean(currentEmail && isAuthorizedAdminEmail(currentEmail) && user?.role === 'admin');

  let denialReason: string | null = null;
  if (!currentEmail) {
    denialReason = 'Authentication required. Please authenticate with designated municipal credentials.';
  } else if (!isAuthorized) {
    denialReason = 'Access Denied: Only the verified municipal administrator account is permitted to access administrative functions.';
  }

  // Assertion check before performing sensitive administrative actions
  const verifyAdminAccess = useCallback((): boolean => {
    if (!isAuthorized) {
      console.warn('[SECURITY GUARD] Access denied: Unauthorized administrative operation attempted by:', currentEmail || 'Anonymous');
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
    isLoading,
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
