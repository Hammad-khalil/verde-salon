'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

/**
 * Cache for initialized SDKs to prevent redundant initialization 
 * and errors during hot module replacement.
 */
let cachedSdks: { firebaseApp: FirebaseApp; auth: any; firestore: any } | null = null;

export function initializeFirebase() {
  if (cachedSdks) return cachedSdks;

  const apps = getApps();
  let firebaseApp: FirebaseApp;

  if (!apps.length) {
    try {
      // Attempt automatic initialization (often works in hosted environments)
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback to provided config
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = apps[0];
  }

  cachedSdks = getSdks(firebaseApp);
  return cachedSdks;
}

export function getSdks(firebaseApp: FirebaseApp) {
  let firestore;
  try {
    // Optimization: Enable persistent local cache for instant data loading on revisit.
    // This can only be called once per app instance.
    firestore = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    // If initializeFirestore was already called (common during development/HMR),
    // get the existing instance.
    firestore = getFirestore(firebaseApp);
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
