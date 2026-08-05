import type { Database } from './database';

export type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export type NotificationPreferencesRow = Database['public']['Tables']['notification_preferences']['Row'];
export type NotificationPreferencesInsert = Database['public']['Tables']['notification_preferences']['Insert'];
export type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

export type ProfilePreferencesRow = Database['public']['Tables']['profile_preferences']['Row'];
export type ProfilePreferencesInsert = Database['public']['Tables']['profile_preferences']['Insert'];
export type ProfilePreferencesUpdate = Database['public']['Tables']['profile_preferences']['Update'];

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'pink' | 'rose' | 'violet' | 'blue' | 'emerald' | 'amber';
export type FontSize = 'sm' | 'md' | 'lg';
export type VisibilityOption = 'public' | 'couple' | 'private';

export interface UserSettings {
  userId: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  language: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  planReminders: boolean;
  proposalAlerts: boolean;
  memoryComments: boolean;
  statusUpdates: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfilePreferences {
  userId: string;
  bio: string;
  showAnniversary: boolean;
  profileVisibility: VisibilityOption;
  partnerVisibility: VisibilityOption;
  activityVisibility: VisibilityOption;
  memoryPrivacy: VisibilityOption;
  proposalPrivacy: VisibilityOption;
  onlineStatusVisibility: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationType = 'plan' | 'proposal' | 'status' | 'memory' | 'system' | 'invite';

export type NotificationFilter = 'all' | 'unread' | NotificationType;
