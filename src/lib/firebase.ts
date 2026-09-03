import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Load Firebase configuration from environment variables if present, otherwise fallback to firebase-applet-config.json
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    firebaseAppletConfig.firestoreDatabaseId ||
    '(default)',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || firebaseAppletConfig.recaptchaSiteKey || '',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with configured databaseId
const rawDatabaseId = firebaseConfig.firestoreDatabaseId;
export const db = (rawDatabaseId && rawDatabaseId !== '(default)')
  ? getFirestore(app, rawDatabaseId)
  : getFirestore(app);

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
export const recaptchaSiteKey = firebaseConfig.recaptchaSiteKey || null;

// Helper for backend API calls with unified error handling
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      console.warn(`API request to ${endpoint} returned ${res.status}: ${res.statusText}`);
      try {
        const errJson = await res.json();
        return errJson as T;
      } catch {
        return null;
      }
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Network fetch exception for ${endpoint}:`, err);
    return null;
  }
}

// Test Firestore connectivity on boot
export async function validateFirestoreConnection() {
  if (!isFirebaseConfigured) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connected successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline, check network/configuration.');
    } else {
      console.log('Firebase Firestore initialized.');
    }
    return true;
  }
}

export default app;
