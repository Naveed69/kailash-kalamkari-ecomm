import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Development: lets Firebase test phone numbers work without solving reCAPTCHA.
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
}

let appCheckInitialized = false;

export async function initAppCheckOnDemand() {
  if (appCheckInitialized || typeof window === "undefined") return;

  const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY as
    | string
    | undefined;
  if (!siteKey) return;

  appCheckInitialized = true;

  if (import.meta.env.DEV) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  try {
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import(
      "firebase/app-check"
    );
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.warn("Firebase App Check failed to initialize:", error);
  }
}

const db = getFirestore(app);

export { app, auth, db };

export * from 'firebase/auth';
