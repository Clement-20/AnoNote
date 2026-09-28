import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import localConfig from "../../../firebase-applet-config.json";

// Standard Firebase web app configuration
// Uses standard Firebase project credentials with default Firestore database
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || localConfig?.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || localConfig?.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || localConfig?.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || localConfig?.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig?.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || localConfig?.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Optional custom database ID fallback for AI Studio sandbox, otherwise standard default database
const databaseId = (localConfig as any)?.firestoreDatabaseId || undefined;

// Initialize Firestore with IndexedDB multi-tab offline persistence
let dbInstance;

try {
  dbInstance = databaseId
    ? initializeFirestore(
        app,
        {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        },
        databaseId
      )
    : initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
} catch (err) {
  // If Firestore is already initialized on this App instance
  dbInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = dbInstance;
export default app;
