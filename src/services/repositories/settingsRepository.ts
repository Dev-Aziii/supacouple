import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { UserSettings, ThemeMode, AccentColor, FontSize } from '../../types/settings';
import type { Database } from '../../types/database';

type SettingsRow = Database['public']['Tables']['user_settings']['Row'];

export interface ISettingsRepository {
  getSettings(userId: string): Promise<UserSettings>;
  saveSettings(userId: string, settings: Partial<Omit<UserSettings, 'userId'>>): Promise<UserSettings>;
  updateTheme(userId: string, theme: ThemeMode): Promise<boolean>;
  updateAccentColor(userId: string, accentColor: AccentColor): Promise<boolean>;
  updateFontSize(userId: string, fontSize: FontSize): Promise<boolean>;
}

export class SettingsRepository implements ISettingsRepository {
  private mapRow(row: SettingsRow): UserSettings {
    return {
      userId: row.user_id,
      theme: (row.theme as ThemeMode) || 'dark',
      accentColor: (row.accent_color as AccentColor) || 'pink',
      fontSize: (row.font_size as FontSize) || 'md',
      language: row.language || 'en',
      timezone: row.timezone || 'UTC',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw normalizeError(error);

      if (!data) {
        // Create default settings if not exists
        const defaultPayload = {
          user_id: userId,
          theme: 'dark',
          accent_color: 'pink',
          font_size: 'md',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };

        const { data: created, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultPayload)
          .select()
          .single();

        if (createError) throw normalizeError(createError);
        return this.mapRow(created);
      }

      return this.mapRow(data);
    } catch (err) {
      console.error('[SettingsRepository] getSettings error:', err);
      return {
        userId,
        theme: 'dark',
        accentColor: 'pink',
        fontSize: 'md',
        language: 'en',
        timezone: 'UTC',
      };
    }
  }

  async saveSettings(
    userId: string,
    settings: Partial<Omit<UserSettings, 'userId'>>
  ): Promise<UserSettings> {
    try {
      const payload: Database['public']['Tables']['user_settings']['Update'] = {};
      if (settings.theme !== undefined) payload.theme = settings.theme;
      if (settings.accentColor !== undefined) payload.accent_color = settings.accentColor;
      if (settings.fontSize !== undefined) payload.font_size = settings.fontSize;
      if (settings.language !== undefined) payload.language = settings.language;
      if (settings.timezone !== undefined) payload.timezone = settings.timezone;

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...payload })
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[SettingsRepository] saveSettings error:', err);
      throw normalizeError(err);
    }
  }

  async updateTheme(userId: string, theme: ThemeMode): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, theme });

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[SettingsRepository] updateTheme error:', err);
      return false;
    }
  }

  async updateAccentColor(userId: string, accentColor: AccentColor): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, accent_color: accentColor });

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[SettingsRepository] updateAccentColor error:', err);
      return false;
    }
  }

  async updateFontSize(userId: string, fontSize: FontSize): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, font_size: fontSize });

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[SettingsRepository] updateFontSize error:', err);
      return false;
    }
  }
}

export const settingsRepository = new SettingsRepository();
