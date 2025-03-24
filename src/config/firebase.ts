import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: 'https://studybuddy-9ed41-default-rtdb.firebaseio.com' // Exact URL from Firebase console
};

// Initialize Firebase
let app;
let db;
let auth;
let rtdb; // Add Realtime Database reference
let analytics = null;
let googleProvider;
let isInitialized = false;

try {
  // Required check for missing or malformed config
  if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is missing required fields');
  }
  
  console.log('Initializing Firebase with project ID:', firebaseConfig.projectId);
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  rtdb = getDatabase(app); // Initialize Realtime Database
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  isInitialized = true;
  
  // Initialize Analytics conditionally
  isSupported().then(supported => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        console.log('Analytics initialized successfully');
      } catch (error) {
        console.error('Error initializing Analytics:', error);
      }
    } else {
      console.log('Analytics not supported in this environment');
    }
  });
} catch (error) {
  console.error('CRITICAL ERROR: Failed to initialize Firebase:', error);

  // Display visible error in the DOM
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.backgroundColor = '#ff5252';
      errorDiv.style.color = 'white';
      errorDiv.style.padding = '20px';
      errorDiv.style.textAlign = 'center';
      errorDiv.style.zIndex = '9999';
      errorDiv.textContent = 'Firebase initialization failed. Please check your console for details.';   
      document.body.appendChild(errorDiv);
    }, 1000);
  }
}

// Function to check if Firebase is initialized
export const checkFirebaseInitialized = () => {
  if (!isInitialized || !app || !db || !auth) {
    console.error('Firebase is not properly initialized');
    return false;
  }
  return true;
};

// Export the Firebase services
export { db, auth, analytics, googleProvider, isInitialized, rtdb };
export default app; 