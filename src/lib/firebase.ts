import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

console.log("[NOMI FIREBASE] Starting initialization...");

const firebaseConfig = {
  projectId: "radiant-plate-p2t1j",
  appId: "1:785955132475:web:8b0b823dbee3e5d09a781e",
  apiKey: "AIzaSyAdwILCFC36ScTI2v5OITDiji0LfwwpBnA",
  authDomain: "radiant-plate-p2t1j.firebaseapp.com",
  databaseId: "ai-studio-nomi-d91c125c-48f4-4571-a79b-c4017a1e247a",
  storageBucket: "radiant-plate-p2t1j.firebasestorage.app",
  messagingSenderId: "785955132475",
};

let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;

try {
  console.log("[NOMI FIREBASE] Initializing Firebase App with config:", firebaseConfig.projectId);
  appInstance = initializeApp(firebaseConfig);
  console.log("[NOMI FIREBASE] Firebase App initialized successfully.");

  console.log("[NOMI FIREBASE] Initializing Firebase Auth...");
  authInstance = getAuth(appInstance);
  console.log("[NOMI FIREBASE] Firebase Auth initialized successfully.");

  console.log("[NOMI FIREBASE] Initializing Firestore with custom databaseId:", firebaseConfig.databaseId);
  dbInstance = getFirestore(appInstance, firebaseConfig.databaseId);
  console.log("[NOMI FIREBASE] Firestore initialized successfully.");

  console.log("[NOMI FIREBASE] Initializing Storage...");
  storageInstance = getStorage(appInstance);
  console.log("[NOMI FIREBASE] Storage initialized successfully.");
} catch (error: any) {
  console.error("[NOMI FIREBASE] CRITICAL ERROR DURING INITIALIZATION:", error);
  // Re-throw so main.tsx crash reporter catches it if it happens during module load
  throw new Error(`Firebase Initialization Failed: ${error.message || error}`);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

