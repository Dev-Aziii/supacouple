import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Calendar, Heart, MessageSquare, Camera, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { NotificationPreferences } from '@/types/settings';
import { cn } from '@/utils/cn';

export const NotificationSettingsSection: React.FC = () => {
  const { notificationPreferences, updateNotificationPreferences, isUpdatingNotifPrefs } = useSettings();
  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isLoading: isPushLoading,
    enablePushNotifications,
    disablePushNotifications,
  } = usePushNotifications();

  const [pushErrorMessage, setPushErrorMessage] = useState<string | null>(null);

  const handleToggle = async (key: keyof Omit<NotificationPreferences, 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!notificationPreferences) return;
    setPushErrorMessage(null);
    const currentValue = notificationPreferences[key];
    const newValue = !currentValue;

    if (key === 'pushNotifications') {
      if (newValue) {
        if (!isPushSupported) {
          setPushErrorMessage('Web Push Notifications are not supported in this browser.');
          return;
        }
        const success = await enablePushNotifications();
        if (!success) {
          if (pushPermission === 'denied') {
            setPushErrorMessage('Notification permission is blocked in your browser settings. Please enable it in browser settings.');
          } else {
            setPushErrorMessage('Failed to subscribe to push notifications. Ensure VAPID keys are configured.');
          }
          await updateNotificationPreferences({ pushNotifications: false });
          return;
        }
      } else {
        await disablePushNotifications();
      }
    }

    await updateNotificationPreferences({ [key]: newValue });
  };

  const toggles: {
    key: keyof Omit<NotificationPreferences, 'userId' | 'createdAt' | 'updatedAt'>;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive weekly summaries and critical account alerts via email',
      icon: Mail,
      color: 'text-blue-400',
    },
    {
      key: 'pushNotifications',
      label: 'PWA Web Push Alerts',
      description: isPushSupported
        ? pushPermission === 'denied'
          ? 'Push blocked in browser settings'
          : 'Receive real-time push notifications on mobile and desktop'
        : 'Push notifications not supported on this browser',
      icon: Smartphone,
      color: 'text-purple-400',
    },
    {
      key: 'planReminders',
      label: 'Plan Reminders',
      description: 'Alerts for upcoming couple dates and calendar events',
      icon: Calendar,
      color: 'text-emerald-400',
    },
    {
      key: 'proposalAlerts',
      label: 'Date Proposals',
      description: 'Notifications when your partner proposes or responds to a date',
      icon: Heart,
      color: 'text-pink-400',
    },
    {
      key: 'memoryComments',
      label: 'Memory Comments & Reactions',
      description: 'Alerts when your partner comments on or reacts to memories',
      icon: Camera,
      color: 'text-rose-400',
    },
    {
      key: 'statusUpdates',
      label: 'Partner Status Updates',
      description: 'Alerts when your partner updates their daily status or mood',
      icon: MessageSquare,
      color: 'text-amber-400',
    },
  ];

  return (
    <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
            <Bell className="w-5 h-5" />
          </div>
          <span>Notification Preferences</span>
        </CardTitle>
        <CardDescription>Choose which events send push notifications and email alerts</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {pushErrorMessage && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-medium mb-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{pushErrorMessage}</span>
          </div>
        )}

        {toggles.map((item) => {
          const Icon = item.icon;
          const isChecked = notificationPreferences ? notificationPreferences[item.key] : true;
          const isPushToggle = item.key === 'pushNotifications';
          const isLoadingThisToggle = isUpdatingNotifPrefs || (isPushToggle && isPushLoading);

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/40 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3.5 pr-4">
                <div className={cn('p-2.5 rounded-xl bg-muted/60', item.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={() => handleToggle(item.key)}
                disabled={isLoadingThisToggle}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  isChecked ? 'bg-pink-500' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    isChecked ? 'translate-x-5' : 'translate-x-0'
                  )}
                >
                  {isLoadingThisToggle && (
                    <Loader2 className="w-3 h-3 animate-spin text-pink-500 m-1" />
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

