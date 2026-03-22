import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDJpKDiXIvu6octNK3F7MU1hXJPce8H3ng",
    authDomain: "agroconnect-e8e9b.firebaseapp.com",
    projectId: "agroconnect-e8e9b",
    storageBucket: "agroconnect-e8e9b.firebasestorage.app",
    messagingSenderId: "491487185809",
    appId: "1:491487185809:web:343b89be6ec38b285be830",
    measurementId: "G-YN895NW73G"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
