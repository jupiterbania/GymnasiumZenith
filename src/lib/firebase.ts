
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    projectId: "gymnasium-zenith",
    appId: "1:40149051232:web:f2d0759c1612a854f66005",
    storageBucket: "gymnasium-zenith.firebasestorage.app",
    apiKey: "AIzaSyAiL6P9_BiA-wW7T76kBBygEWbzncLlUGs",
    authDomain: "gymnasium-zenith.firebaseapp.com",
    messagingSenderId: "40149051232",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


export { app, auth };
