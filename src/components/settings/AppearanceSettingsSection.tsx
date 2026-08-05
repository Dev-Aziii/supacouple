import React from 'react';
import { Palette, Sun, Moon, Laptop, Type, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import { ACCENT_COLOR_MAP } from '@/services/settings/settingsService';
import type { AccentColor, FontSize, ThemeMode } from '@/types/settings';
import { cn } from '@/utils/cn';

export const AppearanceSettingsSection: React.FC = () => {
  const { theme, accentColor, fontSize, setTheme, setAccentColor, setFontSize } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: React.ElementType }[] = [
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'system', label: 'System Default', icon: Laptop },
  ];

  const fontSizes: { id: FontSize; label: string; description: string }[] = [
    { id: 'sm', label: 'Small', description: 'Compact layout & smaller text' },
    { id: 'md', label: 'Medium', description: 'Default standard typography' },
    { id: 'lg', label: 'Large', description: 'Enhanced readability & larger text' },
  ];

  return (
    <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Palette className="w-5 h-5" />
          </div>
          <span>Theme & Appearance</span>
        </CardTitle>
        <CardDescription>Personalize the visual look, accent theme color, and typography scale</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Mode Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Theme Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left',
                    isActive
                      ? 'bg-primary/10 border-primary text-primary font-semibold shadow-sm'
                      : 'bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Accent Theme Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(ACCENT_COLOR_MAP) as AccentColor[]).map((key) => {
              const info = ACCENT_COLOR_MAP[key];
              const isActive = accentColor === key;
              return (
                <button
                  key={key}
                  onClick={() => setAccentColor(key)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-2xl border transition-all text-left',
                    isActive
                      ? 'bg-card border-primary ring-2 ring-primary/40 font-semibold shadow-sm'
                      : 'bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  )}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: info.primary }}
                  >
                    {isActive && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="text-sm">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Scale */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Type className="w-4 h-4" />
            <span>Font Scale</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {fontSizes.map((f) => {
              const isActive = fontSize === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFontSize(f.id)}
                  className={cn(
                    'flex flex-col gap-1 p-3.5 rounded-2xl border transition-all text-left',
                    isActive
                      ? 'bg-primary/10 border-primary text-primary font-semibold shadow-sm'
                      : 'bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  )}
                >
                  <span className="text-sm font-semibold">{f.label}</span>
                  <span className="text-xs opacity-75">{f.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
