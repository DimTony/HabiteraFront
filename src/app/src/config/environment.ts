/**
 * Environment Configuration
 *
 * Centralized configuration for API endpoints and keys.
 * These values are hardcoded for the sandbox environment.
 *
 * For different environments (staging/production), modify these values
 * or create separate config files (e.g., environment.staging.ts)
 */
//for test
export const API_CONFIG = {
  // API Subscription Keys
  SUBSCRIPTION_KEY: "1afda52130f0475c9460e0a02d8d165c",
  ACCOUNT_ENQUIRY_SUBSCRIPTION_KEY: "2a9a5f0b51bc4beea49caaea3f9106d5",

  // API Timeout (milliseconds)
  API_TIMEOUT: 10000,

  // API Base URLs - Sandbox Environment
  ONBOARDING_BASE_URL: "https://api-sandbox.accessbankplc.com/sme/onboarding",
  ONBOARDING_LOGIN_BASE_URL:
    "https://habitera-api-cbf3ancqcub6edc6.canadacentral-01.azurewebsites.net/api/Authentication",
  // "https://api-sandbox.accessbankplc.com/sme/onboarding-login",
  BANKING_BASE_URL: "https://api-sandbox.accessbankplc.com/sme/banking",
  BUSINESS_BASE_URL: "https://api-sandbox.accessbankplc.com/sme/business",
  ACCOUNT_ENQUIRY_BASE_URL: "https://api-sandbox.accessbankplc.com",
} as const;

//for production
export const API_CONFIG2 = {
  SUBSCRIPTION_KEY: "6f52abdaa4f84bd1be912720244936bc",
  ACCOUNT_ENQUIRY_SUBSCRIPTION_KEY: "2a9a5f0b51bc4beea49caaea3f9106d5",

  // API Timeout (milliseconds)
  API_TIMEOUT: 10000,

  // API Base URLs - Sandbox Environment
  ONBOARDING_BASE_URL: "https://api.accessbankplc.com/sme-pilot/onboarding",
  ONBOARDING_LOGIN_BASE_URL:
    "https://api.accessbankplc.com/sme-pilot/onboarding-login",
  BANKING_BASE_URL: "https://api.accessbankplc.com/sme-pilot/banking",
  BUSINESS_BASE_URL: "https://api.accessbankplc.com/sme-pilot/business",
  ACCOUNT_ENQUIRY_BASE_URL: "https://api.accessbankplc.com/sme-pilot",
};

/**
 * VAT Configuration
 *
 * Configurable VAT percentage applied per-product.
 * Only products with isVatApplied === true will have VAT added.
 */
export const VAT_CONFIG = {
  VAT_PERCENTAGE: 7.5,
} as const;

/**
 * Firebase Configuration
 *
 * Configuration for Firebase push notifications.
 * Used only on web platform.
 */
export const FIREBASE_CONFIG = {
  API_KEY: "AIzaSyDaQLbJiYI4p4YIkfqGqJ7DdD6zBgigDf4",
  AUTH_DOMAIN: "business-91f6c.firebaseapp.com",
  PROJECT_ID: "business-91f6c",
  STORAGE_BUCKET: "business-91f6c.firebasestorage.app",
  MESSAGING_SENDER_ID: "826406789681",
  APP_ID: "1:826406789681:web:ee8b7e58443a87c8bf2b10",
  VAPID_KEY:
    "BC6s3f-SfRgFRApuBCuxdbdp1pk5vnJQlRjPylF7e07__F27rpqe4bMMGcKfRd_f3TIipb73mcqWJ0thnMF46Pg",
} as const;
