-- Phase 4 Migration: Database Architecture, Security & Storage
-- Enables Extensions, Tables, Foreign Keys, Constraints, Indexes, Triggers, RLS, and Storage Buckets

-- -----------------------------------------------------------------------------
-- 1. Helper Functions & Triggers
-- -----------------------------------------------------------------------------

-- Trigger function for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 2. Tables Creation
-- -----------------------------------------------------------------------------

-- 2.1 Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  relationship_status TEXT NOT NULL DEFAULT 'single' CHECK (relationship_status IN ('single', 'pending', 'coupled')),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for auto-profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2.2 Couples Table
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_name TEXT NOT NULL,
  anniversary DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'paused')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Statuses Table
CREATE TABLE IF NOT EXISTS public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  status_text TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💬',
  visibility TEXT NOT NULL DEFAULT 'couple' CHECK (visibility IN ('couple', 'private')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  color TEXT NOT NULL DEFAULT '#ec4899',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_plans_dates CHECK (end_at >= start_at)
);

-- 2.6 Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  planned_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('plan', 'proposal', 'status', 'memory', 'system', 'invite')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Triggers for updated_at & single active status
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_couples ON public.couples;
CREATE TRIGGER set_updated_at_couples BEFORE UPDATE ON public.couples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_invitations ON public.invitations;
CREATE TRIGGER set_updated_at_invitations BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_statuses ON public.statuses;
CREATE TRIGGER set_updated_at_statuses BEFORE UPDATE ON public.statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_plans ON public.plans;
CREATE TRIGGER set_updated_at_plans BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_proposals ON public.proposals;
CREATE TRIGGER set_updated_at_proposals BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_memories ON public.memories;
CREATE TRIGGER set_updated_at_memories BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function & Trigger to enforce only one active status per user
CREATE OR REPLACE FUNCTION public.enforce_single_active_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL OR NEW.expires_at > NOW() THEN
    UPDATE public.statuses
    SET expires_at = NOW()
    WHERE user_id = NEW.user_id
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (expires_at IS NULL OR expires_at > NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_status ON public.statuses;
CREATE TRIGGER trigger_single_active_status
  BEFORE INSERT OR UPDATE ON public.statuses
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_active_status();

-- -----------------------------------------------------------------------------
-- 4. Indexes (Performance & Integrity)
-- -----------------------------------------------------------------------------

-- User & Partner lookup indexes
CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON public.profiles(partner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Couples lookup index
CREATE INDEX IF NOT EXISTS idx_couples_created_by ON public.couples(created_by);
CREATE INDEX IF NOT EXISTS idx_couples_status ON public.couples(status);

-- Invitations lookup index
CREATE INDEX IF NOT EXISTS idx_invitations_invite_code ON public.invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON public.invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_receiver_id ON public.invitations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_invitations_couple_id ON public.invitations(couple_id);

-- Statuses lookup index
CREATE INDEX IF NOT EXISTS idx_statuses_user_id ON public.statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_statuses_couple_id ON public.statuses(couple_id);

-- Plans lookup indexes
CREATE INDEX IF NOT EXISTS idx_plans_couple_id ON public.plans(couple_id);
CREATE INDEX IF NOT EXISTS idx_plans_created_by ON public.plans(created_by);
CREATE INDEX IF NOT EXISTS idx_plans_start_at ON public.plans(start_at);

-- Proposals lookup indexes
CREATE INDEX IF NOT EXISTS idx_proposals_couple_id ON public.proposals(couple_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);

-- Memories lookup indexes
CREATE INDEX IF NOT EXISTS idx_memories_couple_id ON public.memories(couple_id);
CREATE INDEX IF NOT EXISTS idx_memories_uploaded_by ON public.memories(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON public.memories(created_at);

-- Notifications lookup indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- -----------------------------------------------------------------------------
-- 5. Helper Function for Couple Membership Security
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_member_of_couple(c_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.couples c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = c_id
    AND (c.created_by = auth.uid() OR p.partner_id = c.created_by OR c.created_by = p.partner_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile or partner profile" ON public.profiles;
CREATE POLICY "Users can view own profile or partner profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR auth.uid() = partner_id OR partner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6.2 Couples Policies
DROP POLICY IF EXISTS "Users can access their couple" ON public.couples;
CREATE POLICY "Users can access their couple" ON public.couples
  FOR ALL USING (public.is_member_of_couple(id))
  WITH CHECK (created_by = auth.uid());

-- 6.3 Invitations Policies
DROP POLICY IF EXISTS "Users can access invitations sent or received by them" ON public.invitations;
CREATE POLICY "Users can access invitations sent or received by them" ON public.invitations
  FOR ALL USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- 6.4 Statuses Policies
DROP POLICY IF EXISTS "Users can access statuses of their couple or self" ON public.statuses;
CREATE POLICY "Users can access statuses of their couple or self" ON public.statuses
  FOR ALL USING (
    user_id = auth.uid() OR (couple_id IS NOT NULL AND public.is_member_of_couple(couple_id))
  );

-- 6.5 Plans Policies
DROP POLICY IF EXISTS "Users can access plans for their couple" ON public.plans;
CREATE POLICY "Users can access plans for their couple" ON public.plans
  FOR ALL USING (public.is_member_of_couple(couple_id));

-- 6.6 Proposals Policies
DROP POLICY IF EXISTS "Users can access proposals for their couple" ON public.proposals;
CREATE POLICY "Users can access proposals for their couple" ON public.proposals
  FOR ALL USING (public.is_member_of_couple(couple_id));

-- 6.7 Memories Policies
DROP POLICY IF EXISTS "Users can access memories for their couple" ON public.memories;
CREATE POLICY "Users can access memories for their couple" ON public.memories
  FOR ALL USING (public.is_member_of_couple(couple_id));

-- 6.8 Notifications Policies
DROP POLICY IF EXISTS "Users can access their own notifications" ON public.notifications;
CREATE POLICY "Users can access their own notifications" ON public.notifications
  FOR ALL USING (recipient_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. Storage Buckets & Policies
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-images', 'proposal-images', false) ON CONFLICT (id) DO NOTHING;

-- Storage Objects Policies for avatars
DROP POLICY IF EXISTS "Users can manage avatars storage" ON storage.objects;
CREATE POLICY "Users can manage avatars storage" ON storage.objects
  FOR ALL USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Storage Objects Policies for memories
DROP POLICY IF EXISTS "Users can manage memories storage" ON storage.objects;
CREATE POLICY "Users can manage memories storage" ON storage.objects
  FOR ALL USING (bucket_id = 'memories' AND auth.uid() IS NOT NULL);

-- Storage Objects Policies for proposal-images
DROP POLICY IF EXISTS "Users can manage proposal images storage" ON storage.objects;
CREATE POLICY "Users can manage proposal images storage" ON storage.objects
  FOR ALL USING (bucket_id = 'proposal-images' AND auth.uid() IS NOT NULL);
