import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/notifications/pushNotificationService';
import { useAuth } from '@/hooks/useAuth';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => Promise<boolean>;
  togglePushNotifications: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported] = useState<boolean>(() => pushNotificationService.isSupported());
  const [permission, setPermission] = useState<NotificationPermission>(() => pushNotificationService.getPermission());
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check subscription state on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSubscription() {
      if (!isSupported || !user) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          if (isMounted) {
            setIsSubscribed(!!sub);
            setPermission(Notification.permission);
          }
        }
      } catch (err) {
        console.error('[usePushNotifications] Error checking subscription:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkSubscription();

    return () => {
      isMounted = false;
    };
  }, [isSupported, user]);

  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const success = await pushNotificationService.subscribeUser(user.id);
      if (success) {
        setIsSubscribed(true);
        setPermission(pushNotificationService.getPermission());
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const disablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const success = await pushNotificationService.unsubscribeUser(user.id);
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const togglePushNotifications = useCallback(async (): Promise<boolean> => {
    if (isSubscribed) {
      return disablePushNotifications();
    } else {
      return enablePushNotifications();
    }
  }, [isSubscribed, enablePushNotifications, disablePushNotifications]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    enablePushNotifications,
    disablePushNotifications,
    togglePushNotifications,
  };
}
