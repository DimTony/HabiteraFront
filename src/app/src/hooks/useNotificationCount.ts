import { useMemo } from 'react';
// import { useActivityByUserQuery } from '../services/api/onboarding/useOnboardingQueries';
// import { activityLogsToNotifications } from '../utils/activityMapper';
// import { getNotificationReadIds } from '../services/storage';
import { useAuthStore } from '../stores/useAuthStore';
import { getNotificationReadIds } from '../stores/storage';
import { useActivityByUserQuery } from './onboarding/useOnboardingQueries';
import { activityLogsToNotifications } from '../utils/activityMapper';

/**
 * Custom hook to get unread notification count
 * Can be used by any component to display notification badge
 */
export function useNotificationCount(): {
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
} {
  // Get user ID from auth store
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  // Fetch activity logs from API
  const {
    data: activityLogs,
    isLoading,
    isError,
  } = useActivityByUserQuery(userId!, {
    enabled: !!userId,
  });

  // Calculate unread count (memoized for performance)
  // Note: This only re-calculates when activityLogs changes. If notification read status
  // changes in localStorage (e.g., marked as read in NotificationsScreen), this won't
  // update until the component using this hook re-mounts or activity logs refetch.
  // This is acceptable as the badge will update when navigating back from notifications.
  const unreadCount = useMemo(() => {
    if (!activityLogs) return 0;

    // Get read notification IDs from localStorage
    const readIds = getNotificationReadIds();
    const readIdsSet = new Set(readIds);

    // Convert activity logs to notifications
    const notifications = activityLogsToNotifications(activityLogs);

    // Count unread notifications
    return notifications.filter((notification) => !readIdsSet.has(notification.id)).length;
  }, [activityLogs]);

  return {
    unreadCount,
    isLoading,
    isError,
  };
}
