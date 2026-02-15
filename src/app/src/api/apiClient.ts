import axios, { type AxiosInstance } from "axios";
// import { handleAutoLogout } from "../auth/logoutService";
// import { getAuthToken, getInAppToken } from "../storage";
import { API_CONFIG as ENV_CONFIG } from "../config/environment";
import { getAuthToken, getInAppToken } from "../stores/storage";
import { handleAutoLogout } from "./services/logout.service";
import { useAuthStore } from "../stores/useAuthStore";

// API Configuration for different services
// Uses centralized configuration from config/environment.ts

export const API_CONFIG = {
  // Base configuration
  SUBSCRIPTION_KEY: ENV_CONFIG.SUBSCRIPTION_KEY,
  ACCOUNT_ENQUIRY_SUBSCRIPTION_KEY: ENV_CONFIG.ACCOUNT_ENQUIRY_SUBSCRIPTION_KEY,
  TIMEOUT: ENV_CONFIG.API_TIMEOUT,

  // Service-specific base URLs
  ONBOARDING: {
    BASE_URL: ENV_CONFIG.ONBOARDING_BASE_URL,
  },
  ONBOARDING_LOGIN: {
    BASE_URL: ENV_CONFIG.ONBOARDING_LOGIN_BASE_URL,
  },
  BANKING: {
    BASE_URL: ENV_CONFIG.BANKING_BASE_URL,
  },
  BUSINESS: {
    BASE_URL: ENV_CONFIG.BUSINESS_BASE_URL,
  },
  ACCOUNT_ENQUIRY: {
    BASE_URL: ENV_CONFIG.ACCOUNT_ENQUIRY_BASE_URL,
  },

  // Legacy - keeping for backward compatibility
  //BASE_URL: "https://sme-onboarding.dev.accessbankplc.com/",
  BASE_URL:
    // "https://habitera-api-cbf3ancqcub6edc6.canadacentral-01.azurewebsites.net/api/",
    "http://localhost:5141/api/",
} as const;

// Common request interceptor for authentication
const createAuthInterceptor = () => ({
  request: async (config: any) => {
    console.log("📤 OUTGOING REQUEST:", {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      headers: config.headers,
      data: config.data,
    });

    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add InAppToken header if available
    const inAppToken = await getInAppToken();
    if (inAppToken) {
      config.headers.InAppToken = inAppToken;
    }

    return config;
  },
  error: (error: any) => Promise.reject(error),
});

// Common response interceptor for error handling
const createResponseInterceptor = () => ({
  response: (response: any) => {
    // Log response for debugging
    console.log("📦 API Response:", {
      status: response.status,
      contentType: response.headers["content-type"],
      dataType: typeof response.data,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
    });

    // Axios automatically handles JSON parsing
    return response;
  },
  error: (error: any) => {
    console.error(
      "❌ API Error:",
      {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        errorKeys: Object.keys(error),
      },
      error,
    );

    // Handle proper HTTP 401 responses
    if (error.response?.status === 401) {
      // Get the request URL to check if it's a login endpoint
      console.log(
        "**********************AUTO LOGOUT MUST WORK HERE**********************",
      );
      const requestUrl = error.config?.url || "";
      const isLoginEndpoint =
        requestUrl.toLowerCase().includes("/login") ||
        requestUrl.toLowerCase().includes("/register") ||
        requestUrl.toLowerCase().includes("/auth");

      // Get current user info for debugging
      //   const authStore = require("../stores/useAuthStore");
        const { user: currentUser, getUserRole: userRole } = useAuthStore.getState();
      
    //   const currentUser = authStore.useAuthStore.getState().user;
    //   const userRole = authStore.useAuthStore.getState().getUserRole();

      console.warn(`❌ 401 UNAUTHORIZED DEBUG:`, {
        url: requestUrl,
        userRole: userRole,
        userType: currentUser?.role,
        userId: currentUser?.id,
        isLoginEndpoint: isLoginEndpoint,
        willTriggerAutoLogout: !isLoginEndpoint,
      });

      // Don't trigger auto-logout for login/auth endpoints to avoid logout loops
      if (!isLoginEndpoint) {
        console.warn(
          `🔒 401 Unauthorized detected - triggering auto-logout for ${userRole} user`,
        );
        handleAutoLogout();
      } else {
        console.warn(
          "🔒 401 Unauthorized on login endpoint - skipping auto-logout to avoid loop",
        );
      }
    }

    // Handle 401s that became network errors due to Azure API Gateway CORS issues
    if (error.code === "ERR_NETWORK" && error.message === "Network Error") {
      const requestUrl = error.config?.url || "";
      const isApiGatewayRequest = requestUrl.includes("accessbankplc.com");
      const isLoginEndpoint =
        requestUrl.toLowerCase().includes("/login") ||
        requestUrl.toLowerCase().includes("/register") ||
        requestUrl.toLowerCase().includes("/auth");

      if (isApiGatewayRequest && !isLoginEndpoint) {
        // const authStore = require("../../stores/useAuthStore");
        // const userRole = authStore.useAuthStore.getState().getUserRole();
        const { getUserRole: userRole } =
          useAuthStore.getState();


        console.warn(
          "🔒 API Gateway network error (likely 401 without CORS headers)",
          {
            url: requestUrl,
            userRole: userRole,
            errorCode: error.code,
          },
        );
        console.warn(
          `🔒 Network error on authenticated endpoint - triggering auto-logout for ${userRole} user`,
        );
        handleAutoLogout();
      }
    }
    return Promise.reject(error);
  },
});

// Legacy API client for backward compatibility
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Subscription-Key": API_CONFIG.SUBSCRIPTION_KEY,
  },
});

// Apply interceptors to all clients
const clients = [
  apiClient,
];
const authInterceptor = createAuthInterceptor();
const responseInterceptor = createResponseInterceptor();

clients.forEach((client) => {
  client.interceptors.request.use(
    authInterceptor.request,
    authInterceptor.error,
  );
  client.interceptors.response.use(
    responseInterceptor.response,
    responseInterceptor.error,
  );
});

export default apiClient;
