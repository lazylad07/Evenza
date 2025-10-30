// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAk5e7-bEJK4IVqI9BAG9ObneGRchQ0xTQ",
  authDomain: "evenza-77a26.firebaseapp.com",
  projectId: "evenza-77a26",
  storageBucket: "evenza-77a26.appspot.com",
  messagingSenderId: "458882595269",
  appId: "1:458882595269:web:fcba012cb3bc739b8a73ac",
  measurementId: "G-DC1YNLP6ZY",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
