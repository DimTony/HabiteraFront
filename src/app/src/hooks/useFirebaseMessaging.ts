import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import {
  getWebToken,
  listenToWebMessages,
  requestWebNotificationPermission,
} from "../config/firebase";
import { useEffect, useState } from "react";

export interface NotificationPayload {
  title?: string;
  body?: string;
  data?: { [key: string]: string | number | boolean };
}

export interface WebFirebasePayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    click_action?: string;
  };
  data?: { [key: string]: string };
}

export interface WebNotificationClickData {
  type: string;
  url?: string;
  data?: { [key: string]: string };
}

class FirebaseMessagingService {
  private isInitialized = false;
  private fcmToken: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const platform = Capacitor.getPlatform();
      // console.log('Initializing Firebase Messaging for platform:', platform);

      if (platform === "web") {
        await this.initializeWeb();
      } else {
        await this.initializeNative();
      }

      this.isInitialized = true;
      // console.log('Firebase Messaging initialized successfully for', platform);
    } catch (error) {
//       console.error("Firebase Messaging initialization failed:", error);
      throw error;
    }
  }

  private async initializeWeb(): Promise<void> {
    // Request notification permissions for web
    const hasPermission = await requestWebNotificationPermission();
    if (!hasPermission) {
      throw new Error("Notification permission denied");
    }

    // Get web FCM token
    const token = await getWebToken();
    if (token) {
      this.fcmToken = token;
    }

    // Setup web message listeners
    this.setupWebListeners();
  }

  private async initializeNative(): Promise<void> {
//     console.log("🔥 Starting native Firebase initialization...");

    const hasPermissions = await this.requestPermissions();
//     console.log("🔑 Permissions granted:", hasPermissions);

    if (hasPermissions) {
      try {
        await this.getToken();
        this.setupListeners();
//         console.log("🎯 Native Firebase initialization complete");
      } catch (error: Error | any) {
//         console.error("❌ Firebase token generation failed:", error);
        if (error.message?.includes("AUTHENTICATION_FAILED")) {
//           console.log("💡 Tip: This usually means Google Play Services issues");
//           console.log("📱 Try on a real device or check AVD has Google APIs");
        }
      }
    } else {
//       console.log(
//         "⚠️ Push notification permissions not granted - skipping token generation"
//       );
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissionStatus = await FirebaseMessaging.checkPermissions();

      if (permissionStatus.receive !== "granted") {
        const result = await FirebaseMessaging.requestPermissions();
        return result.receive === "granted";
      }

      return true;
    } catch (error) {
//       console.error("Permission request failed:", error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const result = await FirebaseMessaging.getToken();
      this.fcmToken = result.token;
//       console.log("FCM Token:", this.fcmToken);
      return this.fcmToken;
    } catch (error) {
//       console.error("Failed to get FCM token:", error);
      return null;
    }
  }

  async deleteToken(): Promise<void> {
    try {
      await FirebaseMessaging.deleteToken();
      this.fcmToken = null;
//       console.log("FCM Token deleted");
    } catch (error) {
//       console.error("Failed to delete FCM token:", error);
    }
  }

  private setupListeners(): void {
    FirebaseMessaging.addListener("notificationReceived", (event) => {
//       console.log("Native notification received:", event);
      this.handleForegroundNotification(
        event.notification as NotificationPayload
      );
    });

    FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
//       console.log("Native notification action performed:", event);
      this.handleNotificationAction(
        event.notification as NotificationPayload,
        event.actionId
      );
    });

    FirebaseMessaging.addListener("tokenReceived", (event) => {
//       console.log("Native token received:", event.token);
      this.fcmToken = event.token;
    });
  }

  private setupWebListeners(): void {
    // Listen for foreground messages on web
    listenToWebMessages((payload: WebFirebasePayload) => {
//       console.log("Web message received:", payload);
      this.handleWebForegroundMessage(payload);
    });

    // Listen for service worker messages (notification clicks)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        (event: MessageEvent) => {
          if (event.data?.type === "NOTIFICATION_CLICK") {
            // SECURITY FIX: CWE-117 - Sanitize notification data before logging
//             console.log("Web notification clicked:", sanitizeForLog(JSON.stringify(event.data)));
            this.handleWebNotificationClick(
              event.data as WebNotificationClickData
            );
          }
        }
      );
    }
  }

  private handleForegroundNotification(
    notification: NotificationPayload
  ): void {
    if (notification.title && notification.body) {
      toast(notification.title, {
        description: notification.body,
        duration: 5000,
        style: {
          background: '#003883',
          color: '#ffffff',
          border: '1px solid #003883',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 56, 131, 0.2), 0 10px 10px -5px rgba(0, 56, 131, 0.1)',
        },
      });
    }
  }

  private handleNotificationAction(
    notification: NotificationPayload,
    actionId: string
  ): void {
//     console.log("Notification tapped with action:", actionId);

    if (notification.data?.screen) {
//       console.log("Navigate to screen:", notification.data.screen);
    }
  }

  private handleWebForegroundMessage(payload: WebFirebasePayload): void {
    const notification = payload.notification || {};

    if (notification.title || notification.body) {
      // Show toast for web foreground messages with unified blue styling
      toast(notification.title || "New Notification", {
        description: notification.body || "You have a new message",
        duration: 5000,
        style: {
          background: '#003883',
          color: '#ffffff',
          border: '1px solid #003883',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 56, 131, 0.2), 0 10px 10px -5px rgba(0, 56, 131, 0.1)',
        },
      });

      // Also show browser notification if page is not focused
      if (
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(notification.title || "New Notification", {
          body: notification.body || "You have a new message",
          icon: "/assets/icons/icon-192.webp",
          tag: "access-business-foreground",
        });
      }
    }
  }

  private handleWebNotificationClick(data: WebNotificationClickData): void {
    // SECURITY FIX: CWE-117 - Sanitize URL before logging
//     console.log("Web notification clicked, navigating to:", sanitizeForLog(data.url || ''));

    // Handle navigation based on click action
    if (data.url && data.url !== "/") {
      // SECURITY FIX: CWE-80 - Validate URL before navigation to prevent XSS/open redirect
      const allowedDomains = ['sme.accessbankplc.com', 'accessbankplc.com'];

//       if (!isUrlSafe(data.url, allowedDomains)) {
// //      console.warn('[SECURITY] Blocked navigation to potentially unsafe URL:', sanitizeForLog(data.url));
//         toast.error('Security Error', {
//           description: 'Cannot navigate to untrusted URL',
//         });
//         return;
//       }

      if (data.url.startsWith("http")) {
        window.open(data.url, "_blank");
      } else {
        window.location.href = data.url;
      }
    }
  }

  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await FirebaseMessaging.subscribeToTopic({ topic });
//       console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
//       console.error(`Failed to subscribe to topic ${topic}:`, error);
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await FirebaseMessaging.unsubscribeFromTopic({ topic });
//       console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
//       console.error(`Failed to unsubscribe from topic ${topic}:`, error);
    }
  }

  getCurrentToken(): string | null {
    return this.fcmToken;
  }

  async refreshAndShowToken(
    onTokenReceived?: (token: string | null, platform: string) => void
  ): Promise<string | null> {
    const platform = Capacitor.getPlatform();

    try {
      if (platform === "web") {
        // For web, get fresh token
        const token = await getWebToken();
        this.fcmToken = token;
      } else {
        // For native platforms, get token
        const result = await FirebaseMessaging.getToken();
        this.fcmToken = result.token;
      }

//       console.log(`${platform} FCM Token:`, this.fcmToken);

      // Call the callback if provided (for updating UI state)
      if (onTokenReceived) {
        onTokenReceived(this.fcmToken, platform.toUpperCase());
      } else {
        // Fallback to alert if no callback provided
        if (this.fcmToken) {
          alert(`${platform.toUpperCase()} FCM Token:\n\n${this.fcmToken}`);
        } else {
          alert(`No FCM token available for ${platform}`);
        }
      }

      return this.fcmToken;
    } catch (error: Error | any) {
//       console.error("Failed to refresh token:", error);

      if (onTokenReceived) {
        onTokenReceived(null, platform.toUpperCase());
      } else {
        alert(`Failed to get token: ${error.message || error}`);
      }

      return null;
    }
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export const firebaseMessagingService = new FirebaseMessagingService();

export const useFirebaseMessagingService = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmPlatform, setFcmPlatform] = useState<string | null>(null);

  const initializeFirebaseMessaging = async () => {
    try {
      await firebaseMessagingService.initialize();

      // Always try to get and show the token
      await firebaseMessagingService.refreshAndShowToken(
        (token, platform) => {
          setFcmToken(token);
          setFcmPlatform(platform);
        }
      );

      // TODO: Send token to your backend server for registration
    } catch (error: Error | any) {
//       console.error("Firebase messaging initialization failed:", error);
      // alert(`Firebase initialization failed: ${error.message || error}`);
    }
  };

  return { fcmToken, fcmPlatform, initializeFirebaseMessaging };
};
