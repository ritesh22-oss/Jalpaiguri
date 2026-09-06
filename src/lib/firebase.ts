import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Securely persist Firebase auth session across app restarts and Play Store updates
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[FIREBASE AUTH] Persistence setting notice:', err);
  });
}

export const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = true;

/**
 * Validates the Firestore connection by attempting to read a known path
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, '_connection_test_', 'test');
    await getDoc(testDoc);
    return true;
  } catch (err: any) {
    // If it's a permission-denied error, we successfully connected to Firestore
    // but the rules (correctly) blocked us. This means the connection is working.
    if (err?.code === 'permission-denied' || (err?.message && err.message.includes('Missing or insufficient permissions'))) {
      return true;
    }
    console.error('Firestore connection validation failed:', err);
    return false;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}
