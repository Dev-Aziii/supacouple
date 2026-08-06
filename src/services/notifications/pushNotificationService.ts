import { supabase } from '../supabase/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface SendPushPayload {
  recipientId: string;
  title: string;
  body: string;
  type: 'plan' | 'proposal' | 'status' | 'memory' | 'system' | 'invite';
  url?: string;
  data?: Record<string, unknown>;
}

export class PushNotificationService {
  /**
   * Check if Web Push API is supported in current browser environment
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Get current Notification permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Get public VAPID key from environment variables
   */
  getVapidPublicKey(): string {
    return import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || '';
  }

  /**
   * Request notification permission and subscribe device to PushManager
   */
  async subscribeUser(userId: string): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('[PushNotificationService] Push notifications not supported on this device');
      return false;
    }

    const vapidPublicKey = this.getVapidPublicKey();
    if (!vapidPublicKey) {
      console.error('[PushNotificationService] VITE_WEB_PUSH_PUBLIC_KEY is not defined in environment variables');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[PushNotificationService] Notification permission denied by user');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      const rawSub = subscription.toJSON();
      const p256dh = rawSub.keys?.p256dh;
      const auth = rawSub.keys?.auth;

      if (!subscription.endpoint || !p256dh || !auth) {
        throw new Error('Failed to extract push subscription keys');
      }

      // Upsert subscription into Supabase DB
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (error) {
        console.error('[PushNotificationService] Error saving push subscription to Supabase:', error);
        return false;
      }

      console.log('[PushNotificationService] Push subscription successfully registered');
      return true;
    } catch (err) {
      console.error('[PushNotificationService] Error subscribing user to push notifications:', err);
      return false;
    }
  }

  /**
   * Unsubscribe device from PushManager and remove from Supabase DB
   */
  async unsubscribeUser(userId: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remove from Supabase DB
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', endpoint);

        if (error) {
          console.error('[PushNotificationService] Error deleting subscription from Supabase:', error);
        }
      }
      return true;
    } catch (err) {
      console.error('[PushNotificationService] Error unsubscribing user:', err);
      return false;
    }
  }

  /**
   * Send a push notification trigger via Supabase Edge Function
   */
  async sendPushNotification(payload: SendPushPayload): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: payload,
      });

      if (error) {
        console.warn('[PushNotificationService] Edge function invoke notice:', error);
        return false;
      }

      return data?.success ?? true;
    } catch (err) {
      console.error('[PushNotificationService] Exception sending push notification:', err);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
