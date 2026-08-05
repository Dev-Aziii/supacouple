import React, { useState } from 'react';
import { Settings, User, Palette, Bell, Shield, KeyRound, Info, Heart } from 'lucide-react';
import { ProfileSettingsSection } from '@/components/settings/ProfileSettingsSection';
import { AppearanceSettingsSection } from '@/components/settings/AppearanceSettingsSection';
import { NotificationSettingsSection } from '@/components/settings/NotificationSettingsSection';
import { PrivacySettingsSection } from '@/components/settings/PrivacySettingsSection';
import { AccountSettingsSection } from '@/components/settings/AccountSettingsSection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'privacy' | 'account' | 'about';

const TAB_NAV: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'account', label: 'Account', icon: KeyRound },
  { id: 'about', label: 'About', icon: Info },
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-border/40 pb-5">
        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
          <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Settings className="w-7 h-7" />
          </div>
          <span>Application Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your profile, visual theme, privacy controls, and notifications
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-border/40">
        {TAB_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && <ProfileSettingsSection />}
        {activeTab === 'appearance' && <AppearanceSettingsSection />}
        {activeTab === 'notifications' && <NotificationSettingsSection />}
        {activeTab === 'privacy' && <PrivacySettingsSection />}
        {activeTab === 'account' && <AccountSettingsSection />}
        {activeTab === 'about' && (
          <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                  <Heart className="w-5 h-5" />
                </div>
                <span>About SupaCouple</span>
              </CardTitle>
              <CardDescription>Modern Progressive Web Application for Couples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>SupaCouple</strong> is crafted with React 19, TypeScript, Vite, Supabase, TanStack Query, Zustand, and TailwindCSS. Designed for couples to connect, plan dates, capture memories, and share relationship milestones.
              </p>
              <div className="p-4 rounded-2xl bg-card/40 border border-border/40 space-y-1 text-xs">
                <div><strong>Version:</strong> 1.0.0 (Phase 11 — Notifications & Settings)</div>
                <div><strong>Stack:</strong> React 19 + TypeScript + Supabase Realtime</div>
                <div><strong>PWA Mode:</strong> Offline Capabilities & Web Push Ready</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
