import type { ActivityLog } from "../hooks/onboarding/useOnboardingQueries";

/**
 * Notification type matching the NotificationsScreen interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment' | 'order' | 'staff' | 'system';
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

/**
 * Activity category patterns for type classification
 */
const ACTIVITY_PATTERNS = {
  // System activities
  login: /user_login|login|sign_in|signin/i,
  logout: /user_logout|logout|sign_out|signout/i,

  // Payment/Transaction activities
  payment: /payment|transaction|transfer|deposit|withdrawal|charge/i,

  // Staff management activities
  staff: /staff|employee|user_created|user_updated|user_deleted|access/i,

  // Order/Product activities
  order: /order|purchase|sale|sell|product|inventory/i,

  // System updates/changes
  update: /update|modify|change|edit|config/i,
} as const;

/**
 * Determine notification type based on activity string
 */
function getNotificationType(activity: string): Notification['type'] {
  const activityLower = activity.toLowerCase();

  if (ACTIVITY_PATTERNS.login.test(activityLower) || ACTIVITY_PATTERNS.logout.test(activityLower)) {
    return 'system';
  }

  if (ACTIVITY_PATTERNS.payment.test(activityLower)) {
    return 'payment';
  }

  if (ACTIVITY_PATTERNS.staff.test(activityLower)) {
    return 'staff';
  }

  if (ACTIVITY_PATTERNS.order.test(activityLower)) {
    return 'order';
  }

  if (ACTIVITY_PATTERNS.update.test(activityLower)) {
    return 'info';
  }

  // Default to info for unknown activities
  return 'info';
}

/**
 * Determine notification priority based on activity type
 */
function getNotificationPriority(activity: string): Notification['priority'] {
  const activityLower = activity.toLowerCase();

  // High priority activities
  if (ACTIVITY_PATTERNS.payment.test(activityLower)) {
    return 'high';
  }

  // Medium priority activities
  if (ACTIVITY_PATTERNS.order.test(activityLower) || ACTIVITY_PATTERNS.staff.test(activityLower)) {
    return 'medium';
  }

  // Low priority for everything else (system, info, etc.)
  return 'low';
}

/**
 * Generate user-friendly title from activity string
 * Converts "User_LogIn" -> "User Login"
 */
function generateTitle(activity: string): string {
  return activity
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert API ActivityLog to UI Notification
 * Maps activity logs from the ActivityByUser endpoint to the notification format
 * expected by NotificationsScreen
 *
 * @param activityLog - Activity log from API
 * @returns Formatted notification for UI display
 */
export function activityToNotification(activityLog: ActivityLog): Notification {
  const type = getNotificationType(activityLog.activity);
  const priority = getNotificationPriority(activityLog.activity);
  const title = generateTitle(activityLog.activity);

  return {
    id: `${activityLog.activity}-${activityLog.createdOn}`,
    title,
    message: activityLog.description,
    type,
    timestamp: activityLog.createdOn,
    isRead: false, // Default to unread for new activities
    priority,
  };
}

/**
 * Convert array of ActivityLogs to Notifications
 * Sorts by most recent first
 *
 * @param activityLogs - Array of activity logs from API
 * @returns Sorted array of notifications
 */
export function activityLogsToNotifications(activityLogs: ActivityLog[]): Notification[] {
  return activityLogs
    .map(activityToNotification)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
