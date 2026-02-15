// Firebase configuration for web platform
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { FIREBASE_CONFIG } from "./environment";

// Firebase config - using centralized configuration
// See config/environment.ts for actual values
const firebaseConfig = {
  apiKey: FIREBASE_CONFIG.API_KEY,
  authDomain: FIREBASE_CONFIG.AUTH_DOMAIN,
  projectId: FIREBASE_CONFIG.PROJECT_ID,
  storageBucket: FIREBASE_CONFIG.STORAGE_BUCKET,
  messagingSenderId: FIREBASE_CONFIG.MESSAGING_SENDER_ID,
  appId: FIREBASE_CONFIG.APP_ID,
};

// VAPID key for web push notifications
const vapidKey = FIREBASE_CONFIG.VAPID_KEY;

// Initialize Firebase only on web platform
let app: any = null;
let messaging: any = null;

if (Capacitor.getPlatform() === "web") {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    //     console.log('Firebase initialized for web platform');
  } catch (error) {
    //     console.error('Firebase initialization failed:', error);
  }
}

export { firebaseConfig, vapidKey, messaging };

// Web-specific Firebase messaging functions
export const getWebToken = async (): Promise<string | null> => {
  if (!messaging || Capacitor.getPlatform() !== "web") {
    //     console.log('Not web platform or messaging not initialized');
    return null;
  }

  try {
    // Check if running in incognito/private mode
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Workers not supported - may be incognito mode");
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
      throw new Error("Notifications not supported in this browser");
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    //     console.log('Service Worker registered:', registration);

    // Get FCM token with better error handling
    const token = await getToken(messaging, { vapidKey });
    //     console.log('Web FCM token:', token);
    return token;
  } catch (error: Error | any) {
    //     console.error('Failed to get web FCM token:', error);

    // Provide specific error messages
    if (error.code === "messaging/unsupported-browser") {
      throw new Error("Push notifications not supported in this browser");
    } else if (error.code === "messaging/permission-blocked") {
      throw new Error("Notification permission blocked");
    } else if (
      error.message?.includes("incognito") ||
      error.message?.includes("private")
    ) {
      throw new Error(
        "Push notifications not available in incognito/private mode",
      );
    } else {
      throw new Error(
        `Token generation failed: ${error.message || "Unknown error"}`,
      );
    }
  }
};

export const listenToWebMessages = (callback: (payload: any) => void) => {
  if (!messaging || Capacitor.getPlatform() !== "web") {
    return;
  }

  // Listen for foreground messages
  onMessage(messaging, (payload) => {
    //     console.log('Web foreground message received:', payload);
    callback(payload);
  });
};

export const requestWebNotificationPermission = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() !== "web" || !("Notification" in window)) {
    //     console.log('Not web platform or notifications not supported');
    return false;
  }

  try {
    // Check current permission first
    const currentPermission = Notification.permission;
    //     console.log('Current notification permission:', currentPermission);

    if (currentPermission === "granted") {
      return true;
    }

    if (currentPermission === "denied") {
      throw new Error(
        "Notification permission denied. Please enable in browser settings.",
      );
    }

    // Request permission
    const permission = await Notification.requestPermission();
    //     console.log('Permission request result:', permission);

    return permission === "granted";
  } catch (error: Error | any) {
    //     console.error('Failed to request notification permission:', error);
    throw new Error(
      `Permission request failed: ${error.message || "Unknown error"}`,
    );
  }
};
