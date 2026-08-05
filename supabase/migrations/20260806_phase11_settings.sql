-- Phase 11 Migration: Notification Preferences, User Settings & Profile Preferences
-- Includes RLS, Indexes, Triggers, and Constraints

-- -----------------------------------------------------------------------------
-- 1. Tables Creation
-- -----------------------------------------------------------------------------

-- 1.1 User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  accent_color TEXT NOT NULL DEFAULT 'pink' CHECK (accent_color IN ('pink', 'rose', 'violet', 'blue', 'emerald', 'amber')),
  font_size TEXT NOT NULL DEFAULT 'md' CHECK (font_size IN ('sm', 'md', 'lg')),
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  plan_reminders BOOLEAN NOT NULL DEFAULT true,
  proposal_alerts BOOLEAN NOT NULL DEFAULT true,
  memory_comments BOOLEAN NOT NULL DEFAULT true,
  status_updates BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 Profile Preferences & Privacy Table
CREATE TABLE IF NOT EXISTS public.profile_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  show_anniversary BOOLEAN NOT NULL DEFAULT true,
  profile_visibility TEXT NOT NULL DEFAULT 'couple' CHECK (profile_visibility IN ('public', 'couple', 'private')),
  partner_visibility TEXT NOT NULL DEFAULT 'couple' CHECK (partner_visibility IN ('public', 'couple', 'private')),
  activity_visibility TEXT NOT NULL DEFAULT 'couple' CHECK (activity_visibility IN ('public', 'couple', 'private')),
  memory_privacy TEXT NOT NULL DEFAULT 'couple' CHECK (memory_privacy IN ('public', 'couple', 'private')),
  proposal_privacy TEXT NOT NULL DEFAULT 'couple' CHECK (proposal_privacy IN ('public', 'couple', 'private')),
  online_status_visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. Triggers for updated_at
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS set_updated_at_user_settings ON public.user_settings;
CREATE TRIGGER set_updated_at_user_settings
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_notification_preferences ON public.notification_preferences;
CREATE TRIGGER set_updated_at_notification_preferences
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_profile_preferences ON public.profile_preferences;
CREATE TRIGGER set_updated_at_profile_preferences
  BEFORE UPDATE ON public.profile_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 3. Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_preferences_user_id ON public.profile_preferences(user_id);

-- -----------------------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- -----------------------------------------------------------------------------

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;

-- RLS for user_settings
DROP POLICY IF EXISTS "Users can view own user_settings" ON public.user_settings;
CREATE POLICY "Users can view own user_settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_settings" ON public.user_settings;
CREATE POLICY "Users can insert own user_settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_settings" ON public.user_settings;
CREATE POLICY "Users can update own user_settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS for notification_preferences
DROP POLICY IF EXISTS "Users can view own notification_preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification_preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification_preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification_preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification_preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification_preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS for profile_preferences
DROP POLICY IF EXISTS "Users can view own profile_preferences" ON public.profile_preferences;
CREATE POLICY "Users can view own profile_preferences" ON public.profile_preferences
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND (p.partner_id = auth.uid() OR auth.uid() = p.partner_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile_preferences" ON public.profile_preferences;
CREATE POLICY "Users can insert own profile_preferences" ON public.profile_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile_preferences" ON public.profile_preferences;
CREATE POLICY "Users can update own profile_preferences" ON public.profile_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Auto-provision settings trigger for new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.profile_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();
