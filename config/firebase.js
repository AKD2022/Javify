// config/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCaFfOZ61OM9NEHQ8ikbCmLQIM9OUBvj8k",
  authDomain: "apcsa-df990.firebaseapp.com",
  databaseURL: "https://apcsa-df990-default-rtdb.firebaseio.com",
  projectId: "apcsa-df990",
  storageBucket: "apcsa-df990.appspot.com",
  messagingSenderId: "1008073691567",
  appId: "1:1008073691567:web:c2766f036d16fb336b9f5a",
  measurementId: "G-T119N8EMC8"
};

// Initialize app once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Fix: Use AsyncStorage for auth persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Auth might already be initialized in Expo environments
  auth = getAuth(app);
}

// Firestore using Firebase JS SDK
const db = getFirestore(app);

export { auth, db };
