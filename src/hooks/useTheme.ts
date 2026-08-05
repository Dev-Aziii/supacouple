import { useSettingsStore } from '../store/settingsStore';
import { useSettings } from './useSettings';
import type { ThemeMode, AccentColor, FontSize } from '../types/settings';

export function useTheme() {
  const { theme, accentColor, fontSize, setTheme, setAccentColor, setFontSize } = useSettingsStore();
  const { updateSettings, isUpdatingSettings } = useSettings();

  const changeTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      await updateSettings({ theme: newTheme });
    } catch (err) {
      console.error('[useTheme] Error persisting theme:', err);
    }
  };

  const changeAccent = async (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    try {
      await updateSettings({ accentColor: newAccent });
    } catch (err) {
      console.error('[useTheme] Error persisting accent color:', err);
    }
  };

  const changeFontSize = async (newFontSize: FontSize) => {
    setFontSize(newFontSize);
    try {
      await updateSettings({ fontSize: newFontSize });
    } catch (err) {
      console.error('[useTheme] Error persisting font size:', err);
    }
  };

  return {
    theme,
    accentColor,
    fontSize,
    setTheme: changeTheme,
    setAccentColor: changeAccent,
    setFontSize: changeFontSize,
    isUpdatingSettings,
  };
}
