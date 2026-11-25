'use client';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, browserSessionPersistence, getAuth, initializeAuth, type Auth } from 'firebase/auth';

let cached: Auth | null = null;

// Only used for admin sign-in. All data access goes through the server API, and Firestore rules deny direct client access.
// Persistence uses localStorage/sessionStorage (not IndexedDB), which avoids desktop browsers hanging on a blocked or locked IndexedDB.
export function auth(): Auth {
  if (cached) return cached;
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  try {
    cached = initializeAuth(app, { persistence: [browserLocalPersistence, browserSessionPersistence] });
  } catch {
    cached = getAuth(app);
  }
  return cached;
}
