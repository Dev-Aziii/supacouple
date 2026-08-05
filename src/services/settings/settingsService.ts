import { settingsRepository } from '../repositories/settingsRepository';
import type { UserSettings, ThemeMode, AccentColor, FontSize } from '../../types/settings';

export const ACCENT_COLOR_MAP: Record<AccentColor, { label: string; primary: string; hsl: string }> = {
  pink: { label: 'Pink', primary: '#ec4899', hsl: '330 81% 60%' },
  rose: { label: 'Rose', primary: '#f43f5e', hsl: '343 89% 60%' },
  violet: { label: 'Violet', primary: '#8b5cf6', hsl: '262 83% 58%' },
  blue: { label: 'Blue', primary: '#3b82f6', hsl: '217 91% 60%' },
  emerald: { label: 'Emerald', primary: '#10b981', hsl: '160 84% 39%' },
  amber: { label: 'Amber', primary: '#f59e0b', hsl: '38 92% 50%' },
};

export class SettingsService {
  async fetchSettings(userId: string): Promise<UserSettings> {
    return settingsRepository.getSettings(userId);
  }

  async saveSettings(userId: string, settings: Partial<Omit<UserSettings, 'userId'>>): Promise<UserSettings> {
    const updated = await settingsRepository.saveSettings(userId, settings);
    if (settings.theme) this.applyTheme(settings.theme);
    if (settings.accentColor) this.applyAccentColor(settings.accentColor);
    if (settings.fontSize) this.applyFontSize(settings.fontSize);
    return updated;
  }

  applyTheme(theme: ThemeMode): void {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isSystemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('supa_couple_theme', theme);
  }

  applyAccentColor(accent: AccentColor): void {
    const root = window.document.documentElement;
    const config = ACCENT_COLOR_MAP[accent] || ACCENT_COLOR_MAP.pink;
    root.style.setProperty('--primary', config.hsl);
    root.style.setProperty('--ring', config.hsl);
    root.setAttribute('data-accent', accent);
    localStorage.setItem('supa_couple_accent', accent);
  }

  applyFontSize(fontSize: FontSize): void {
    const root = window.document.documentElement;
    root.setAttribute('data-font-size', fontSize);
    if (fontSize === 'sm') {
      root.style.fontSize = '14px';
    } else if (fontSize === 'lg') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
    localStorage.setItem('supa_couple_font_size', fontSize);
  }

  initLocalStylePreferences(): void {
    const savedTheme = (localStorage.getItem('supa_couple_theme') as ThemeMode) || 'dark';
    const savedAccent = (localStorage.getItem('supa_couple_accent') as AccentColor) || 'pink';
    const savedFontSize = (localStorage.getItem('supa_couple_font_size') as FontSize) || 'md';

    this.applyTheme(savedTheme);
    this.applyAccentColor(savedAccent);
    this.applyFontSize(savedFontSize);
  }
}

export const settingsService = new SettingsService();
