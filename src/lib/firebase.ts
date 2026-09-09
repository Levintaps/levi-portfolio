import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

// firebase/app and firebase/firestore are loaded with dynamic import() so
// their code lands in an on-demand chunk instead of the eager entry bundle.
// Most visitors never reach the sections that need Firestore, so they
// should not pay for the SDK before the page renders.
let appPromise: Promise<FirebaseApp> | null = null;
let dbPromise: Promise<Firestore> | null = null;

function getApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app');
      const existing = getApps();
      if (existing.length > 0) return existing[0];

      return initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
    })();
  }
  return appPromise;
}

export function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const [{ getFirestore }, app] = await Promise.all([
        import('firebase/firestore'),
        getApp(),
      ]);
      return getFirestore(app);
    })();
  }
  return dbPromise;
}
