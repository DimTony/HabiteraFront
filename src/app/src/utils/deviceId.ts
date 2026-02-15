/**
 * Device ID Utility
 * 
 * Gets device ID for login purposes:
 * - On mobile platforms: Uses Capacitor Device plugin to get the device UUID
 * - On web: Generates a random ID and stores it in localStorage for persistence
 */

import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

const DEVICE_ID_STORAGE_KEY = 'device_id';

/**
 * Generate a random device ID for web platform
 * Uses crypto.randomUUID if available, otherwise falls back to Math.random
 */
function generateRandomDeviceId(): string {
  // Try to use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: Generate a random ID using timestamp and random number
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${randomPart2}`;
}

/**
 * Get or create device ID
 * 
 * On mobile: Returns the device UUID from Capacitor Device plugin
 * On web: Returns existing device ID from localStorage, or generates and stores a new one
 * 
 * @returns Promise<string> The device ID
 */
export async function getDeviceId(): Promise<string> {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // On mobile platforms, use Capacitor Device plugin
    try {
      const { identifier } = await Device.getId();
      return identifier;
    } catch (error) {
      // Fallback to web method if Device plugin fails
      console.warn('Failed to get device ID from Capacitor Device plugin, falling back to web method:', error);
      return getWebDeviceId();
    }
  } else {
    // On web platform, use our custom localStorage implementation
    return getWebDeviceId();
  }
}

/**
 * Get or create device ID for web platform
 * Stores in localStorage for persistence
 */
function getWebDeviceId(): string {
  try {
    // Try to get existing device ID from localStorage
    const existingId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    
    if (existingId) {
      return existingId;
    }
    
    // Generate new device ID and store it
    const newDeviceId = generateRandomDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, newDeviceId);
    
    return newDeviceId;
  } catch (error) {
    // If localStorage is not available, generate a temporary ID
    console.warn('localStorage not available, generating temporary device ID:', error);
    return generateRandomDeviceId();
  }
}

