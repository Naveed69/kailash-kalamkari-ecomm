import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// const firebaseKey = process.env.PUBLIC_FIREBASE_API_KEY
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "kalamkari-7da33.firebaseapp.com",
  projectId: "kalamkari-7da33",
  storageBucket: "kalamkari-7da33.appspot.com",
  messagingSenderId: "749889824034",
  appId: "1:749889824034:web:0b4a2d6dfd9a747ed3f17b",
  measurementId: "G-RQ2XL2N2L4"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
}

export { app, auth };

// Add any additional Firebase services you need here
export * from 'firebase/auth';
