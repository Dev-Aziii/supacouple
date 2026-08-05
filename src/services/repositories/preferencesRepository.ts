import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type {
  NotificationPreferences,
  ProfilePreferences,
  VisibilityOption,
} from '../../types/settings';
import type { Database } from '../../types/database';

type NotifPrefRow = Database['public']['Tables']['notification_preferences']['Row'];
type ProfilePrefRow = Database['public']['Tables']['profile_preferences']['Row'];

export interface IPreferencesRepository {
  getNotificationPreferences(userId: string): Promise<NotificationPreferences>;
  updateNotificationPreferences(
    userId: string,
    prefs: Partial<Omit<NotificationPreferences, 'userId'>>
  ): Promise<NotificationPreferences>;
  getProfilePreferences(userId: string): Promise<ProfilePreferences>;
  updateProfilePreferences(
    userId: string,
    prefs: Partial<Omit<ProfilePreferences, 'userId'>>
  ): Promise<ProfilePreferences>;
  updatePrivacy(
    userId: string,
    privacy: Partial<
      Pick<
        ProfilePreferences,
        | 'profileVisibility'
        | 'partnerVisibility'
        | 'activityVisibility'
        | 'memoryPrivacy'
        | 'proposalPrivacy'
        | 'onlineStatusVisibility'
      >
    >
  ): Promise<ProfilePreferences>;
  updateProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      anniversary?: string | null;
      timezone?: string;
      language?: string;
    }
  ): Promise<boolean>;
}

export class PreferencesRepository implements IPreferencesRepository {
  private mapNotifRow(row: NotifPrefRow): NotificationPreferences {
    return {
      userId: row.user_id,
      emailNotifications: row.email_notifications,
      pushNotifications: row.push_notifications,
      planReminders: row.plan_reminders,
      proposalAlerts: row.proposal_alerts,
      memoryComments: row.memory_comments,
      statusUpdates: row.status_updates,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapProfilePrefRow(row: ProfilePrefRow): ProfilePreferences {
    return {
      userId: row.user_id,
      bio: row.bio || '',
      showAnniversary: row.show_anniversary,
      profileVisibility: (row.profile_visibility as VisibilityOption) || 'couple',
      partnerVisibility: (row.partner_visibility as VisibilityOption) || 'couple',
      activityVisibility: (row.activity_visibility as VisibilityOption) || 'couple',
      memoryPrivacy: (row.memory_privacy as VisibilityOption) || 'couple',
      proposalPrivacy: (row.proposal_privacy as VisibilityOption) || 'couple',
      onlineStatusVisibility: row.online_status_visibility,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw normalizeError(error);

      if (!data) {
        const defaultPayload = {
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          plan_reminders: true,
          proposal_alerts: true,
          memory_comments: true,
          status_updates: true,
        };

        const { data: created, error: createError } = await supabase
          .from('notification_preferences')
          .insert(defaultPayload)
          .select()
          .single();

        if (createError) throw normalizeError(createError);
        return this.mapNotifRow(created);
      }

      return this.mapNotifRow(data);
    } catch (err) {
      console.error('[PreferencesRepository] getNotificationPreferences error:', err);
      return {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        planReminders: true,
        proposalAlerts: true,
        memoryComments: true,
        statusUpdates: true,
      };
    }
  }

  async updateNotificationPreferences(
    userId: string,
    prefs: Partial<Omit<NotificationPreferences, 'userId'>>
  ): Promise<NotificationPreferences> {
    try {
      const payload: Database['public']['Tables']['notification_preferences']['Update'] = {};
      if (prefs.emailNotifications !== undefined) payload.email_notifications = prefs.emailNotifications;
      if (prefs.pushNotifications !== undefined) payload.push_notifications = prefs.pushNotifications;
      if (prefs.planReminders !== undefined) payload.plan_reminders = prefs.planReminders;
      if (prefs.proposalAlerts !== undefined) payload.proposal_alerts = prefs.proposalAlerts;
      if (prefs.memoryComments !== undefined) payload.memory_comments = prefs.memoryComments;
      if (prefs.statusUpdates !== undefined) payload.status_updates = prefs.statusUpdates;

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: userId, ...payload })
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapNotifRow(data);
    } catch (err) {
      console.error('[PreferencesRepository] updateNotificationPreferences error:', err);
      throw normalizeError(err);
    }
  }

  async getProfilePreferences(userId: string): Promise<ProfilePreferences> {
    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw normalizeError(error);

      if (!data) {
        const defaultPayload = {
          user_id: userId,
          bio: '',
          show_anniversary: true,
          profile_visibility: 'couple',
          partner_visibility: 'couple',
          activity_visibility: 'couple',
          memory_privacy: 'couple',
          proposal_privacy: 'couple',
          online_status_visibility: true,
        };

        const { data: created, error: createError } = await supabase
          .from('profile_preferences')
          .insert(defaultPayload)
          .select()
          .single();

        if (createError) throw normalizeError(createError);
        return this.mapProfilePrefRow(created);
      }

      return this.mapProfilePrefRow(data);
    } catch (err) {
      console.error('[PreferencesRepository] getProfilePreferences error:', err);
      return {
        userId,
        bio: '',
        showAnniversary: true,
        profileVisibility: 'couple',
        partnerVisibility: 'couple',
        activityVisibility: 'couple',
        memoryPrivacy: 'couple',
        proposalPrivacy: 'couple',
        onlineStatusVisibility: true,
      };
    }
  }

  async updateProfilePreferences(
    userId: string,
    prefs: Partial<Omit<ProfilePreferences, 'userId'>>
  ): Promise<ProfilePreferences> {
    try {
      const payload: Database['public']['Tables']['profile_preferences']['Update'] = {};
      if (prefs.bio !== undefined) payload.bio = prefs.bio;
      if (prefs.showAnniversary !== undefined) payload.show_anniversary = prefs.showAnniversary;
      if (prefs.profileVisibility !== undefined) payload.profile_visibility = prefs.profileVisibility;
      if (prefs.partnerVisibility !== undefined) payload.partner_visibility = prefs.partnerVisibility;
      if (prefs.activityVisibility !== undefined) payload.activity_visibility = prefs.activityVisibility;
      if (prefs.memoryPrivacy !== undefined) payload.memory_privacy = prefs.memoryPrivacy;
      if (prefs.proposalPrivacy !== undefined) payload.proposal_privacy = prefs.proposalPrivacy;
      if (prefs.onlineStatusVisibility !== undefined) payload.online_status_visibility = prefs.onlineStatusVisibility;

      const { data, error } = await supabase
        .from('profile_preferences')
        .upsert({ user_id: userId, ...payload })
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapProfilePrefRow(data);
    } catch (err) {
      console.error('[PreferencesRepository] updateProfilePreferences error:', err);
      throw normalizeError(err);
    }
  }

  async updatePrivacy(
    userId: string,
    privacy: Partial<
      Pick<
        ProfilePreferences,
        | 'profileVisibility'
        | 'partnerVisibility'
        | 'activityVisibility'
        | 'memoryPrivacy'
        | 'proposalPrivacy'
        | 'onlineStatusVisibility'
      >
    >
  ): Promise<ProfilePreferences> {
    return this.updateProfilePreferences(userId, privacy);
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      anniversary?: string | null;
      timezone?: string;
      language?: string;
    }
  ): Promise<boolean> {
    try {
      // 1. Update profiles table
      const profilePayload: Database['public']['Tables']['profiles']['Update'] = {};
      if (data.displayName !== undefined) profilePayload.display_name = data.displayName;
      if (data.avatarUrl !== undefined) profilePayload.avatar_url = data.avatarUrl;

      if (Object.keys(profilePayload).length > 0) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', userId);
        if (profileErr) throw normalizeError(profileErr);
      }

      // 2. Update bio & anniversary in profile_preferences or couples
      if (data.bio !== undefined) {
        await this.updateProfilePreferences(userId, { bio: data.bio });
      }

      // 3. Update timezone or language in user_settings
      if (data.timezone !== undefined || data.language !== undefined) {
        const settingsPayload: Database['public']['Tables']['user_settings']['Update'] = {};
        if (data.timezone !== undefined) settingsPayload.timezone = data.timezone;
        if (data.language !== undefined) settingsPayload.language = data.language;
        await supabase.from('user_settings').upsert({ user_id: userId, ...settingsPayload });
      }

      // 4. Update anniversary in couple if user has active couple
      if (data.anniversary !== undefined) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('partner_id')
          .eq('id', userId)
          .single();

        if (profile?.partner_id) {
          const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .or(`created_by.eq.${userId},created_by.eq.${profile.partner_id}`)
            .eq('status', 'active')
            .maybeSingle();

          if (couple?.id) {
            await supabase
              .from('couples')
              .update({ anniversary: data.anniversary })
              .eq('id', couple.id);
          }
        }
      }

      return true;
    } catch (err) {
      console.error('[PreferencesRepository] updateProfile error:', err);
      return false;
    }
  }
}

export const preferencesRepository = new PreferencesRepository();
