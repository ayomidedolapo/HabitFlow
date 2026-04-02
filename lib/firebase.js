import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDwb3gkdW1tzZL8dNWaio9WvXQReHfYoHQ",
  authDomain: "habit-tracker-91542.firebaseapp.com",
  projectId: "habit-tracker-91542",
  messagingSenderId: "363455937593",
  appId: "1:363455937593:web:4ba0e4b1334c553388a1e8",
};

const app = initializeApp(firebaseConfig);

let messaging = null;

export const getMessagingInstance = async () => {
  const supported = await isSupported();

  if (!supported) return null;

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
};