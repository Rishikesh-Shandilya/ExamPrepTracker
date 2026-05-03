import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Firebase configuration and SDK services used by the app.
const firebaseConfig = {
  apiKey: "AIzaSyDD92jTbVjg-wn45gT5jypJ6zuJtayZavA",
  authDomain: "gate-prep-tracker-82c70.firebaseapp.com",
  projectId: "gate-prep-tracker-82c70",
  storageBucket: "gate-prep-tracker-82c70.firebasestorage.app",
  messagingSenderId: "89172749293",
  appId: "1:89172749293:web:b4e5b89da2edf7086f95e4"
};


const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

const auth =
  getAuth(app);

const provider =
  new GoogleAuthProvider();



export const firebaseServices = {
  db,
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  doc,
  setDoc,
  getDoc
};
