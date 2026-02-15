import React, { useEffect, useState, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useFirebaseMessagingService } from "./hooks/useFirebaseMessaging";
import { useAuthStore } from "./stores/useAuthStore";
import { getUsername } from "./stores/storage";
import { addDeviceToken } from "./hooks/onboarding/useOnboardingMutations";
import queryClient from "./api/services/queryClient";
import { AccountProvider } from "./contexts/AccountContext";

export default function AppWithQuery() {
  const { fcmToken, fcmPlatform, initializeFirebaseMessaging } =
    useFirebaseMessagingService();

  const { user } = useAuthStore();
  const [cachedUsername, setCachedUsername] = useState<string | null>(null);
  const tokenRegistrationRef = useRef<Set<string>>(new Set());
  const lastRegistrationRef = useRef<number>(0);

  // Handle cached username retrieval
  useEffect(() => {
    getUsername().then((username) => {
      setCachedUsername(username);
    });
  }, []);

  // Handle device token registration with memoization and interval refresh
  useEffect(() => {
    if (!fcmToken) {
      initializeFirebaseMessaging();
      return;
    }

    const username = user?.email || cachedUsername;
    if (!username) return;

    const tokenKey = `${username}-${fcmToken}`;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Check if we should register the token:
    // 1. Never registered before, OR
    // 2. More than 1 hour has passed since last registration (for periodic refresh)
    const shouldRegister =
      !tokenRegistrationRef.current.has(tokenKey) ||
      now - lastRegistrationRef.current > oneHour;

    if (shouldRegister) {
      addDeviceToken({
        username,
        token: fcmToken,
      })
        .then(() => {
          //           console.log("Device token added successfully");
          tokenRegistrationRef.current.add(tokenKey);
          lastRegistrationRef.current = now;
        })
        .catch((error: Error | any) => {
          //           console.error(`Failed to add device token: ${error.message || error}`);
        });
    }
  }, [fcmToken, fcmPlatform, user, cachedUsername]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccountProvider>
          <App />
        </AccountProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
