import React from 'react';
import { Settings, Moon, Bell, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/button';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-7 h-7 text-muted-foreground" />
          <span>Application Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your preferences, theme, and notifications
        </p>
      </div>

      <div className="space-y-4">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-400" /> Theme Mode
            </CardTitle>
            <CardDescription>Select app visual theme</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              Dark Mode
            </Button>
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              Light Mode
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              System Default
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-400" /> Push Notifications
            </CardTitle>
            <CardDescription>PWA background push alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Coming Soon — PWA Web Push notification settings
            </p>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" /> Privacy & Location
            </CardTitle>
            <CardDescription>Data sharing preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Coming Soon — Granular location sharing toggles
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
