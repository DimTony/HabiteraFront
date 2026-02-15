import { getAuthToken, getTokenExpiry } from "../../stores/storage";
import { useAuthStore } from "../../stores/useAuthStore";
// import { getAuthToken } from "../storage";
// import { getTokenExpiry } from "../storage";

/**
 * Token Expiration Service
 *
 * Checks if authentication tokens have expired by:
 * 1. Decoding JWT tokens to extract the `exp` (expiration) claim
 * 2. Falling back to checking stored token expiry from localStorage
 *
 * Returns true if token is expired or missing, false otherwise
 */

/**
 * Decode JWT token payload without verification
 * JWT format: header.payload.signature
 * We only need the payload to check expiration
 */
function decodeJWT(token: string): { exp?: number } | null {
  try {
    // Split token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null; // Invalid JWT format
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed (base64url may not have padding)
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64url to JSON
    const decodedPayload = atob(
      paddedPayload.replace(/-/g, "+").replace(/_/g, "/"),
    );
    const parsedPayload = JSON.parse(decodedPayload);

    return parsedPayload;
  } catch (error) {
    console.warn("⚠️ TOKEN-EXPIRY: Failed to decode JWT token", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired based on its `exp` claim
 */
function isJWTExpired(token: string): boolean | null {
  const payload = decodeJWT(token);

  if (!payload || typeof payload.exp !== "number") {
    return null; // Cannot determine expiration from JWT
  }

  // `exp` is in seconds since epoch, convert to milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  // Token is expired if current time is past expiration time
  return currentTime >= expirationTime;
}

/**
 * Check if token is expired using stored expiry timestamp
 */
function isStoredExpiryExpired(): boolean | null {
  try {
    const storedExpiry = getTokenExpiry();

    if (!storedExpiry) {
      return null; // No stored expiry available
    }

    // Handle both string and number formats
    let expiryTime: number;
    if (typeof storedExpiry === "string") {
      expiryTime = new Date(storedExpiry).getTime();
    } else if (typeof storedExpiry === "number") {
      // If it's a timestamp in seconds, convert to milliseconds
      expiryTime =
        storedExpiry < 10000000000 ? storedExpiry * 1000 : storedExpiry;
    } else {
      return null;
    }

    if (isNaN(expiryTime)) {
      return null; // Invalid date
    }

    const currentTime = Date.now();
    return currentTime >= expiryTime;
  } catch (error) {
    console.warn("⚠️ TOKEN-EXPIRY: Failed to check stored expiry", error);
    return null;
  }
}

/**
 * Check if the authentication token has expired
 *
 * This function:
 * 1. Gets the token from auth store or SecureStorage
 * 2. Tries to decode JWT to check `exp` claim
 * 3. Falls back to checking stored token expiry
 * 4. Returns true if expired, false if valid, null if cannot determine
 *
 * @returns boolean | null - true if expired, false if valid, null if cannot determine
 */
export async function isTokenExpired(): Promise<boolean | null> {
  try {
    // First, try to get token from auth store
    const authStore = useAuthStore.getState();
    let token = authStore.token;

    // If not in store, try to get from SecureStorage
    if (!token) {
      token = await getAuthToken();
    }

    // If no token at all, consider it expired (user should not be authenticated)
    if (!token) {
      console.log("🔍 TOKEN-EXPIRY: No token found");
      return true;
    }

    // Try to check JWT expiration first
    const jwtExpired = isJWTExpired(token);
    if (jwtExpired !== null) {
      if (jwtExpired) {
        console.log("⏰ TOKEN-EXPIRY: JWT token has expired");
      }
      return jwtExpired;
    }

    // Fall back to stored expiry
    const storedExpired = isStoredExpiryExpired();
    if (storedExpired !== null) {
      if (storedExpired) {
        console.log("⏰ TOKEN-EXPIRY: Stored token expiry has passed");
      }
      return storedExpired;
    }

    // Cannot determine expiration - assume valid for now
    // (This prevents false positives that would log users out)
    console.warn("⚠️ TOKEN-EXPIRY: Cannot determine token expiration");
    return false;
  } catch (error) {
    console.error("❌ TOKEN-EXPIRY: Error checking token expiration", error);
    // On error, don't assume expired (prevent false logouts)
    return false;
  }
}
