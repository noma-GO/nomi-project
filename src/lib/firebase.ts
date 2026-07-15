import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "radiant-plate-p2t1j",
  appId: "1:785955132475:web:8b0b823dbee3e5d09a781e",
  apiKey: "AIzaSyAdwILCFC36ScTI2v5OITDiji0LfwwpBnA",
  authDomain: "radiant-plate-p2t1j.firebaseapp.com",
  databaseId: "ai-studio-nomi-d91c125c-48f4-4571-a79b-c4017a1e247a",
  storageBucket: "radiant-plate-p2t1j.firebasestorage.app",
  messagingSenderId: "785955132475",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Support custom named databaseId
export const db = getFirestore(app, firebaseConfig.databaseId);
export const storage = getStorage(app);
