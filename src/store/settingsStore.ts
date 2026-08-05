import { create } from 'zustand';
import type { ThemeMode, AccentColor, FontSize, NotificationFilter } from '../types/settings';
import { settingsService } from '../services/settings/settingsService';

interface SettingsState {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  language: string;
  activeNotificationsFilter: NotificationFilter;
  notificationSearchQuery: string;

  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
  setFontSize: (fontSize: FontSize) => void;
  setLanguage: (lang: string) => void;
  setNotificationsFilter: (filter: NotificationFilter) => void;
  setNotificationSearchQuery: (query: string) => void;
  hydrateFromSettings: (settings: {
    theme?: ThemeMode;
    accentColor?: AccentColor;
    fontSize?: FontSize;
    language?: string;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: (localStorage.getItem('supa_couple_theme') as ThemeMode) || 'dark',
  accentColor: (localStorage.getItem('supa_couple_accent') as AccentColor) || 'pink',
  fontSize: (localStorage.getItem('supa_couple_font_size') as FontSize) || 'md',
  language: 'en',
  activeNotificationsFilter: 'all',
  notificationSearchQuery: '',

  setTheme: (theme) => {
    settingsService.applyTheme(theme);
    set({ theme });
  },

  setAccentColor: (accentColor) => {
    settingsService.applyAccentColor(accentColor);
    set({ accentColor });
  },

  setFontSize: (fontSize) => {
    settingsService.applyFontSize(fontSize);
    set({ fontSize });
  },

  setLanguage: (language) => set({ language }),

  setNotificationsFilter: (activeNotificationsFilter) => set({ activeNotificationsFilter }),

  setNotificationSearchQuery: (notificationSearchQuery) => set({ notificationSearchQuery }),

  hydrateFromSettings: (settings) => {
    if (settings.theme) {
      settingsService.applyTheme(settings.theme);
    }
    if (settings.accentColor) {
      settingsService.applyAccentColor(settings.accentColor);
    }
    if (settings.fontSize) {
      settingsService.applyFontSize(settings.fontSize);
    }
    set((state) => ({
      ...state,
      theme: settings.theme || state.theme,
      accentColor: settings.accentColor || state.accentColor,
      fontSize: settings.fontSize || state.fontSize,
      language: settings.language || state.language,
    }));
  },
}));
