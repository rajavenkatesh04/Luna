import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env["NEXT_PUBLIC_FIREBASE_apiKey"],
    authDomain: process.env["NEXT_PUBLIC_FIREBASE_authDomain"],
    projectId: process.env["NEXT_PUBLIC_FIREBASE_projectId"],
    storageBucket: process.env["NEXT_PUBLIC_FIREBASE_storageBucket"],
    messagingSenderId: process.env["NEXT_PUBLIC_FIREBASE_messagingSenderId"],
    appId: process.env["NEXT_PUBLIC_FIREBASE_appId"],
    measurementId: process.env["NEXT_PUBLIC_FIREBASE_measurementId "]
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };