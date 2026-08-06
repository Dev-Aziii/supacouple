import React, { useState } from 'react';
import { User, Save, Loader2, Calendar, Globe, Clock, FileText, Upload, Image as ImageIcon, Check, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/hooks/useSession';
import { useSettings } from '@/hooks/useSettings';
import { storageService } from '@/services/storage/storageService';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
];

export const ProfileSettingsSection: React.FC = () => {
  const { profile, user } = useSession();
  const { profilePreferences, settings, updateProfile, isUpdatingProfile } = useSettings();

  const [displayName, setDisplayName] = useState(
    profile?.displayName || user?.user_metadata?.display_name || ''
  );
  const [bio, setBio] = useState(profilePreferences?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [anniversary, setAnniversary] = useState('');
  const [timezone, setTimezone] = useState(settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [language, setLanguage] = useState(settings?.language || 'en');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { path, error } = await storageService.uploadImage('avatars', filePath, file, {
        upsert: true,
        contentType: file.type,
      });

      if (error) {
        // Fallback if bucket doesn't exist or permissions fail: use object URL or error text
        setUploadError('Failed to upload file to storage. You can paste an image URL instead.');
      } else if (path) {
        const publicUrl = storageService.getPublicUrl('avatars', path);
        setAvatarUrl(publicUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading image';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    await updateProfile({
      displayName,
      bio,
      avatarUrl: avatarUrl || undefined,
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
        <CardDescription>Update your personal information, bio, avatar, and relationship preferences</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Avatar Selection & Upload Section */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-4">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Profile Avatar</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary border-2 border-primary/30 flex items-center justify-center shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-9 h-9 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Upload Controls & URL input */}
              <div className="space-y-3 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-all shadow-sm">
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? 'Uploading...' : 'Upload Picture'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-muted-foreground hover:text-destructive h-8"
                    >
                      Remove Avatar
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Or paste image URL (e.g. https://...)"
                    className="rounded-xl text-xs h-8"
                  />
                </div>

                {uploadError && (
                  <p className="text-[11px] text-destructive font-medium">{uploadError}</p>
                )}
              </div>
            </div>

            {/* Curated Presets */}
            <div className="pt-2 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-pink-400" />
                <span>Or pick from preset avatars:</span>
              </p>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                      avatarUrl === url
                        ? 'border-pink-500 scale-105 ring-2 ring-pink-500/20'
                        : 'border-border/60 hover:border-pink-400'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-pink-500/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
