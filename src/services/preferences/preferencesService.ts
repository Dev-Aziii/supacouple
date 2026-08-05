import { preferencesRepository } from '../repositories/preferencesRepository';
import { supabase } from '../supabase/client';
import type { NotificationPreferences, ProfilePreferences } from '../../types/settings';

export class PreferencesService {
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    return preferencesRepository.getNotificationPreferences(userId);
  }

  async updateNotificationPreferences(
    userId: string,
    prefs: Partial<Omit<NotificationPreferences, 'userId'>>
  ): Promise<NotificationPreferences> {
    return preferencesRepository.updateNotificationPreferences(userId, prefs);
  }

  async getProfilePreferences(userId: string): Promise<ProfilePreferences> {
    return preferencesRepository.getProfilePreferences(userId);
  }

  async updateProfilePreferences(
    userId: string,
    prefs: Partial<Omit<ProfilePreferences, 'userId'>>
  ): Promise<ProfilePreferences> {
    return preferencesRepository.updateProfilePreferences(userId, prefs);
  }

  async exportAccountData(userId: string): Promise<void> {
    try {
      const [profileRes, prefRes, settingsRes, notifPrefRes, plansRes, proposalsRes, memoriesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('profile_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('plans').select('*').eq('created_by', userId),
        supabase.from('proposals').select('*').eq('created_by', userId),
        supabase.from('memories').select('*').or(`created_by.eq.${userId},uploaded_by.eq.${userId}`),
      ]);

      const exportBundle = {
        exportedAt: new Date().toISOString(),
        profile: profileRes.data || null,
        preferences: prefRes.data || null,
        settings: settingsRes.data || null,
        notificationPreferences: notifPrefRes.data || null,
        plans: plansRes.data || [],
        proposals: proposalsRes.data || [],
        memories: memoriesRes.data || [],
      };

      const jsonString = JSON.stringify(exportBundle, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SupaCouple_Data_Export_${userId.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PreferencesService] exportAccountData error:', err);
      throw err;
    }
  }
}

export const preferencesService = new PreferencesService();
