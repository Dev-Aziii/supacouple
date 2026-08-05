import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings/settingsService';
import { preferencesService } from '../services/preferences/preferencesService';
import { preferencesRepository } from '../services/repositories/preferencesRepository';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import type { UserSettings, NotificationPreferences, ProfilePreferences } from '../types/settings';

export const USER_SETTINGS_QUERY_KEY = ['user_settings'];
export const NOTIF_PREFS_QUERY_KEY = ['notification_preferences'];
export const PROFILE_PREFS_QUERY_KEY = ['profile_preferences'];

export function useSettings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const hydrateFromSettings = useSettingsStore((state) => state.hydrateFromSettings);

  // 1. User Settings Query
  const settingsQuery = useQuery({
    queryKey: [...USER_SETTINGS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const data = await settingsService.fetchSettings(userId);
      hydrateFromSettings({
        theme: data.theme,
        accentColor: data.accentColor,
        fontSize: data.fontSize,
        language: data.language,
      });
      return data;
    },
    enabled: Boolean(userId),
  });

  // 2. Notification Preferences Query
  const notifPrefsQuery = useQuery({
    queryKey: [...NOTIF_PREFS_QUERY_KEY, userId],
    queryFn: () => (userId ? preferencesService.getNotificationPreferences(userId) : Promise.reject('No user')),
    enabled: Boolean(userId),
  });

  // 3. Profile Preferences Query
  const profilePrefsQuery = useQuery({
    queryKey: [...PROFILE_PREFS_QUERY_KEY, userId],
    queryFn: () => (userId ? preferencesService.getProfilePreferences(userId) : Promise.reject('No user')),
    enabled: Boolean(userId),
  });

  // 4. Update User Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<Omit<UserSettings, 'userId'>>) => {
      if (!userId) throw new Error('User not authenticated');
      return settingsService.saveSettings(userId, newSettings);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([...USER_SETTINGS_QUERY_KEY, userId], updated);
      hydrateFromSettings({
        theme: updated.theme,
        accentColor: updated.accentColor,
        fontSize: updated.fontSize,
        language: updated.language,
      });
    },
  });

  // 5. Update Notification Preferences Mutation
  const updateNotifPrefsMutation = useMutation({
    mutationFn: (newPrefs: Partial<Omit<NotificationPreferences, 'userId'>>) => {
      if (!userId) throw new Error('User not authenticated');
      return preferencesService.updateNotificationPreferences(userId, newPrefs);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([...NOTIF_PREFS_QUERY_KEY, userId], updated);
    },
  });

  // 6. Update Profile Preferences Mutation
  const updateProfilePrefsMutation = useMutation({
    mutationFn: (newPrefs: Partial<Omit<ProfilePreferences, 'userId'>>) => {
      if (!userId) throw new Error('User not authenticated');
      return preferencesService.updateProfilePreferences(userId, newPrefs);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([...PROFILE_PREFS_QUERY_KEY, userId], updated);
    },
  });

  // 7. Update Full Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      anniversary?: string | null;
      timezone?: string;
      language?: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return preferencesRepository.updateProfile(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: [...PROFILE_PREFS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [...USER_SETTINGS_QUERY_KEY, userId] });
    },
  });

  return {
    settings: settingsQuery.data,
    notificationPreferences: notifPrefsQuery.data,
    profilePreferences: profilePrefsQuery.data,
    isLoading: settingsQuery.isLoading || notifPrefsQuery.isLoading || profilePrefsQuery.isLoading,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isUpdatingNotifPrefs: updateNotifPrefsMutation.isPending,
    isUpdatingProfilePrefs: updateProfilePrefsMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateSettings: updateSettingsMutation.mutateAsync,
    updateNotificationPreferences: updateNotifPrefsMutation.mutateAsync,
    updateProfilePreferences: updateProfilePrefsMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    exportAccountData: () => (userId ? preferencesService.exportAccountData(userId) : Promise.resolve()),
  };
}
