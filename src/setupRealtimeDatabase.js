// This script creates the Firebase Realtime Database if it doesn't exist
// Run this script with: node src/setupRealtimeDatabase.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Setup require for ES modules
const require = createRequire(import.meta.url);
// Load environment variables
dotenv.config();

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Create a test entry to ensure database is initialized
async function initializeDatabase() {
  try {
    console.log('Initializing Realtime Database...');
    
    // Write test data
    await set(ref(db, 'test/init'), {
      timestamp: new Date().toISOString(),
      message: 'Database initialized successfully'
    });
    
    console.log('✅ Realtime Database initialized successfully!');
    console.log(`Database URL: ${firebaseConfig.databaseURL}`);
    console.log('You can now use the Realtime Database for video calls.');
  } catch (error) {
    console.error('❌ Failed to initialize Realtime Database:', error);
    console.log('Please check your Firebase project configuration.');
    console.log('Make sure the Realtime Database is enabled in your Firebase console.');
    console.log('Visit: https://console.firebase.google.com/project/_/database');
  }
}

initializeDatabase(); 