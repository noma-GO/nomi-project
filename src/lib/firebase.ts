import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously as fbSignInAnonymously, 
  onAuthStateChanged as fbOnAuthStateChanged, 
  signOut as fbSignOut, 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword, 
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword, 
  updateProfile as fbUpdateProfile,
  linkWithCredential as fbLinkWithCredential, 
  EmailAuthProvider as fbEmailAuthProvider 
} from "firebase/auth";
import { 
  getFirestore, 
  collection as fbCollection, 
  doc as fbDoc, 
  setDoc as fbSetDoc, 
  addDoc as fbAddDoc, 
  onSnapshot as fbOnSnapshot, 
  getDocs as fbGetDocs, 
  query as fbQuery, 
  orderBy as fbOrderBy, 
  deleteDoc as fbDeleteDoc, 
  updateDoc as fbUpdateDoc, 
  increment as fbIncrement, 
  getDoc as fbGetDoc 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

console.log("[NOMI FIREBASE] Starting initialization with complete offline-first fail-safes...");

const firebaseConfig = {
  projectId: "radiant-plate-p2t1j",
  appId: "1:785955132475:web:8b0b823dbee3e5d09a781e",
  apiKey: "AIzaSyAdwILCFC36ScTI2v5OITDiji0LfwwpBnA",
  authDomain: "radiant-plate-p2t1j.firebaseapp.com",
  databaseId: "ai-studio-nomi-d91c125c-48f4-4571-a79b-c4017a1e247a",
  storageBucket: "radiant-plate-p2t1j.firebasestorage.app",
  messagingSenderId: "785955132475",
};

let isFirebaseAvailable = false;
let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;

try {
  console.log("[NOMI FIREBASE] Initializing Firebase App...");
  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance, firebaseConfig.databaseId);
  storageInstance = getStorage(appInstance);
  isFirebaseAvailable = true;
  console.log("[NOMI FIREBASE] Firebase initialized successfully.");
} catch (error: any) {
  console.error("[NOMI FIREBASE] Firebase initialization failed, entering local offline mode:", error);
  isFirebaseAvailable = false;
  appInstance = {};
  authInstance = { currentUser: null };
  dbInstance = {};
  storageInstance = {};
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

export { isFirebaseAvailable };

// 1. SAFE AUTH OPERATIONS
export async function signInAnonymously(authObj: any) {
  if (!isFirebaseAvailable || !authObj) {
    console.warn("[NOMI FIREBASE MOCK] signInAnonymously called but Firebase is offline/disabled.");
    return { user: { uid: "guest-user", isAnonymous: true } };
  }
  try {
    const result = await Promise.race([
      fbSignInAnonymously(authObj),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
    ]);
    return result;
  } catch (err) {
    console.warn("[NOMI FIREBASE MOCK] signInAnonymously failed, using guest session:", err);
    return { user: { uid: "guest-user", isAnonymous: true } };
  }
}

export function onAuthStateChanged(authObj: any, callback: any) {
  if (!isFirebaseAvailable || !authObj) {
    console.warn("[NOMI FIREBASE MOCK] onAuthStateChanged: Firebase offline. Triggering guest user immediately.");
    setTimeout(() => {
      callback(null);
    }, 50);
    return () => {};
  }
  try {
    let fired = false;
    const timeoutId = setTimeout(() => {
      if (!fired) {
        console.warn("[NOMI FIREBASE] Auth listener timed out. Forcing guest mode...");
        fired = true;
        callback(null);
      }
    }, 5000);

    const unsub = fbOnAuthStateChanged(authObj, (user) => {
      if (!fired) {
        fired = true;
        clearTimeout(timeoutId);
        callback(user);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  } catch (err) {
    console.error("[NOMI FIREBASE] Error setting up fbOnAuthStateChanged:", err);
    setTimeout(() => callback(null), 50);
    return () => {};
  }
}

export async function signOut(authObj: any) {
  if (!isFirebaseAvailable || !authObj) return;
  try {
    await fbSignOut(authObj);
  } catch (err) {
    console.warn("[NOMI FIREBASE] signOut failed:", err);
  }
}

export async function signInWithEmailAndPassword(authObj: any, email: any, password: any) {
  if (!isFirebaseAvailable || !authObj) {
    throw new Error("Firebase offline");
  }
  try {
    return await fbSignInWithEmailAndPassword(authObj, email, password);
  } catch (err) {
    console.warn("[NOMI FIREBASE] signInWithEmailAndPassword failed:", err);
    throw err;
  }
}

export async function createUserWithEmailAndPassword(authObj: any, email: any, password: any) {
  if (!isFirebaseAvailable || !authObj) {
    throw new Error("Firebase offline");
  }
  try {
    return await fbCreateUserWithEmailAndPassword(authObj, email, password);
  } catch (err) {
    console.warn("[NOMI FIREBASE] createUserWithEmailAndPassword failed:", err);
    throw err;
  }
}

export async function updateProfile(userObj: any, profile: any) {
  if (!isFirebaseAvailable || !userObj) return;
  try {
    await fbUpdateProfile(userObj, profile);
  } catch (err) {
    console.warn("[NOMI FIREBASE] updateProfile failed:", err);
  }
}

export async function linkWithCredential(userObj: any, credential: any) {
  if (!isFirebaseAvailable || !userObj) {
    throw new Error("Firebase offline");
  }
  try {
    return await fbLinkWithCredential(userObj, credential);
  } catch (err) {
    console.warn("[NOMI FIREBASE] linkWithCredential failed:", err);
    throw err;
  }
}

export const EmailAuthProvider = fbEmailAuthProvider;

// 2. SAFE FIRESTORE OPERATIONS
export function collection(dbObj: any, path: string, ...pathSegments: string[]) {
  if (!isFirebaseAvailable || !dbObj) return null;
  try {
    return fbCollection(dbObj, path, ...pathSegments);
  } catch (err) {
    console.error("[NOMI FIREBASE] collection helper failed:", err);
    return null;
  }
}

export function doc(dbObj: any, path: string, ...pathSegments: string[]) {
  if (!isFirebaseAvailable || !dbObj) return null;
  try {
    return fbDoc(dbObj, path, ...pathSegments);
  } catch (err) {
    console.error("[NOMI FIREBASE] doc helper failed:", err);
    return null;
  }
}

export function query(queryRef: any, ...queryConstraints: any[]) {
  if (!isFirebaseAvailable || !queryRef) return null;
  try {
    // Remove null or undefined query constraints (such as failed orderBy)
    const validConstraints = queryConstraints.filter(c => c !== null && c !== undefined);
    return fbQuery(queryRef, ...validConstraints);
  } catch (err) {
    console.error("[NOMI FIREBASE] query helper failed:", err);
    return null;
  }
}

export function orderBy(fieldPath: string, directionStr?: any) {
  try {
    return fbOrderBy(fieldPath, directionStr);
  } catch (err) {
    return null;
  }
}

export function increment(value: number) {
  try {
    return fbIncrement(value);
  } catch (err) {
    return value;
  }
}

export function onSnapshot(ref: any, callback: any, errback?: any) {
  if (!isFirebaseAvailable || !ref) {
    console.warn("[NOMI FIREBASE MOCK] onSnapshot: Firebase offline. Triggering errback.");
    if (errback) {
      setTimeout(() => errback(new Error("Firebase offline")), 50);
    }
    return () => {};
  }
  try {
    return fbOnSnapshot(ref, callback, (err) => {
      console.warn("[NOMI FIREBASE] onSnapshot error:", err);
      if (errback) errback(err);
    });
  } catch (err: any) {
    console.error("[NOMI FIREBASE] Error setting up fbOnSnapshot:", err);
    if (errback) {
      setTimeout(() => errback(err), 50);
    }
    return () => {};
  }
}

export async function getDoc(docRef: any): Promise<any> {
  if (!isFirebaseAvailable || !docRef) {
    throw new Error("Firebase offline");
  }
  try {
    const result = await Promise.race([
      fbGetDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
    ]);
    return result;
  } catch (err) {
    console.warn("[NOMI FIREBASE] getDoc failed:", err);
    throw err;
  }
}

export async function getDocs(queryRef: any): Promise<any> {
  if (!isFirebaseAvailable || !queryRef) {
    throw new Error("Firebase offline");
  }
  try {
    const result = await Promise.race([
      fbGetDocs(queryRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
    ]);
    return result;
  } catch (err) {
    console.warn("[NOMI FIREBASE] getDocs failed:", err);
    throw err;
  }
}

export async function setDoc(docRef: any, data: any, options?: any) {
  if (!isFirebaseAvailable || !docRef) {
    console.warn("[NOMI FIREBASE MOCK] setDoc mocked due to offline state.");
    return;
  }
  try {
    await Promise.race([
      fbSetDoc(docRef, data, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
    ]);
  } catch (err) {
    console.warn("[NOMI FIREBASE] setDoc failed:", err);
    throw err;
  }
}

export async function updateDoc(docRef: any, data: any) {
  if (!isFirebaseAvailable || !docRef) {
    console.warn("[NOMI FIREBASE MOCK] updateDoc mocked due to offline state.");
    return;
  }
  try {
    await Promise.race([
      fbUpdateDoc(docRef, data),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
    ]);
  } catch (err) {
    console.warn("[NOMI FIREBASE] updateDoc failed:", err);
    throw err;
  }
}

export async function addDoc(collectionRef: any, data: any) {
  if (!isFirebaseAvailable || !collectionRef) {
    console.warn("[NOMI FIREBASE MOCK] addDoc mocked due to offline state.");
    return { id: "mock-id-" + Math.random().toString(36).substr(2, 9) };
  }
  try {
    const result = await Promise.race([
      fbAddDoc(collectionRef, data),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
    ]);
    return result;
  } catch (err) {
    console.warn("[NOMI FIREBASE] addDoc failed:", err);
    throw err;
  }
}

export async function deleteDoc(docRef: any) {
  if (!isFirebaseAvailable || !docRef) {
    console.warn("[NOMI FIREBASE MOCK] deleteDoc mocked due to offline state.");
    return;
  }
  try {
    await Promise.race([
      fbDeleteDoc(docRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
    ]);
  } catch (err) {
    console.warn("[NOMI FIREBASE] deleteDoc failed:", err);
    throw err;
  }
}
