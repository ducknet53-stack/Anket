import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Default configuration connected to the auto-provisioned project
const defaultConfig = {
  apiKey: "AIzaSyBiSD5owhwVhBG4_QfO2-BvJiavLnryoYY",
  authDomain: "gen-lang-client-0599303397.firebaseapp.com",
  projectId: "gen-lang-client-0599303397",
  storageBucket: "gen-lang-client-0599303397.firebasestorage.app",
  messagingSenderId: "1015784650353",
  appId: "1:1015784650353:web:72300d168e64bf6c4f4dd0",
  firestoreDatabaseId: "ai-studio-17e47a74-01ef-4af5-b4b7-442e421acbea"
};

// Retrieve current configuration (with custom user overrides from localStorage)
export const getFirebaseConfig = () => {
  const saved = localStorage.getItem("anket_savaslari_firebase_config");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey) {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing saved Firebase config:", e);
    }
  }
  return defaultConfig;
};

// Save a custom user configuration
export const saveFirebaseConfig = (config: typeof defaultConfig) => {
  localStorage.setItem("anket_savaslari_firebase_config", JSON.stringify(config));
  window.location.reload();
};

// Reset to system defaults
export const resetFirebaseConfig = () => {
  localStorage.removeItem("anket_savaslari_firebase_config");
  window.location.reload();
};

const config = getFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(config) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);
