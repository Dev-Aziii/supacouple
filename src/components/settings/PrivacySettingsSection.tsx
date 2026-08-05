import React from 'react';
import { Shield, Eye, Lock, Users, Activity, Heart, Camera, Radio } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import type { VisibilityOption, ProfilePreferences } from '@/types/settings';
import { cn } from '@/utils/cn';

export const PrivacySettingsSection: React.FC = () => {
  const { profilePreferences, updateProfilePreferences, isUpdatingProfilePrefs } = useSettings();

  const handleSelectVisibility = async (
    key: keyof Omit<ProfilePreferences, 'userId' | 'bio' | 'showAnniversary' | 'onlineStatusVisibility' | 'createdAt' | 'updatedAt'>,
    val: VisibilityOption
  ) => {
    await updateProfilePreferences({ [key]: val });
  };

  const handleToggleOnlineStatus = async () => {
    if (!profilePreferences) return;
    await updateProfilePreferences({
      onlineStatusVisibility: !profilePreferences.onlineStatusVisibility,
    });
  };

  const visibilityFields: {
    key: keyof Omit<ProfilePreferences, 'userId' | 'bio' | 'showAnniversary' | 'onlineStatusVisibility' | 'createdAt' | 'updatedAt'>;
    label: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    { key: 'profileVisibility', label: 'Profile Visibility', description: 'Who can view your profile details', icon: Eye },
    { key: 'partnerVisibility', label: 'Partner Info Visibility', description: 'Who can see your partner connection', icon: Users },
    { key: 'activityVisibility', label: 'Activity Visibility', description: 'Who can see your recent activity feed', icon: Activity },
    { key: 'memoryPrivacy', label: 'Memory Privacy', description: 'Default privacy setting for uploaded photos & memories', icon: Camera },
    { key: 'proposalPrivacy', label: 'Proposal Privacy', description: 'Default privacy for date proposals', icon: Heart },
  ];

  const visibilityOptions: { id: VisibilityOption; label: string; icon: React.ElementType }[] = [
    { id: 'couple', label: 'Couple Only', icon: Users },
    { id: 'private', label: 'Only Me', icon: Lock },
    { id: 'public', label: 'Public', icon: Eye },
  ];

  return (
    <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Shield className="w-5 h-5" />
          </div>
          <span>Privacy & Visibility Controls</span>
        </CardTitle>
        <CardDescription>Manage who can see your memories, activities, and online status</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Online status toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/40">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Online Status Visibility</h4>
              <p className="text-xs text-muted-foreground">Show active online indicator to your partner</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profilePreferences?.onlineStatusVisibility ?? true}
            onClick={handleToggleOnlineStatus}
            disabled={isUpdatingProfilePrefs}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              (profilePreferences?.onlineStatusVisibility ?? true) ? 'bg-pink-500' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                (profilePreferences?.onlineStatusVisibility ?? true) ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Granular Visibility Options */}
        <div className="space-y-5">
          {visibilityFields.map((field) => {
            const Icon = field.icon;
            const currentVal = profilePreferences ? profilePreferences[field.key] : 'couple';

            return (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-semibold text-foreground">{field.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{field.description}</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {visibilityOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isActive = currentVal === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectVisibility(field.key, opt.id)}
                        disabled={isUpdatingProfilePrefs}
                        className={cn(
                          'flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all',
                          isActive
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-card/40 border-border/40 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <OptIcon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
