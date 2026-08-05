import React, { useState } from 'react';
import { User, Save, Loader2, Calendar, Globe, Clock, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/hooks/useSession';
import { useSettings } from '@/hooks/useSettings';

export const ProfileSettingsSection: React.FC = () => {
  const { profile, user } = useSession();
  const { profilePreferences, settings, updateProfile, isUpdatingProfile } = useSettings();

  const [displayName, setDisplayName] = useState(
    profile?.displayName || user?.user_metadata?.display_name || ''
  );
  const [bio, setBio] = useState(profilePreferences?.bio || '');
  const [anniversary, setAnniversary] = useState('');
  const [timezone, setTimezone] = useState(settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [language, setLanguage] = useState(settings?.language || 'en');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    await updateProfile({
      displayName,
      bio,
      anniversary: anniversary || undefined,
      timezone,
      language,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
            <User className="w-5 h-5" />
          </div>
          <span>Profile Customization</span>
        </CardTitle>
        <CardDescription>Update your personal information, bio, and relationship preferences</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Display Name</span>
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name or nickname"
              className="rounded-xl"
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Bio</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a cute message or note for your partner..."
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Relationship Anniversary */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Relationship Anniversary</span>
            </label>
            <Input
              type="date"
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Updates your couple relationship anniversary date
            </p>
          </div>

          {/* Grid for Timezone & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Timezone</span>
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/40 pt-4">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 font-medium">Profile saved successfully!</span>
          ) : (
            <span className="text-xs text-muted-foreground">All changes sync automatically across devices</span>
          )}
          <Button type="submit" disabled={isUpdatingProfile} className="rounded-xl shadow-sm">
            {isUpdatingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
