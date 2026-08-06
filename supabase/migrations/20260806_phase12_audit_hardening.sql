-- Phase 12 Migration: Complete Security Hardening, RLS Repair, Storage Security & RPC Sanitation

-- -----------------------------------------------------------------------------
-- 1. Helper Function with Secure search_path (C5)
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- -----------------------------------------------------------------------------
-- 2. Hardened RPC Functions (C1, C2, C5)
-- -----------------------------------------------------------------------------

-- Drop legacy signature for accept_couple_invite
DROP FUNCTION IF EXISTS public.accept_couple_invite(TEXT, UUID, DATE);

CREATE OR REPLACE FUNCTION public.accept_couple_invite(
  p_invite_code TEXT,
  p_anniversary DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_receiver_id UUID := auth.uid();
  v_invite RECORD;
  v_sender_profile RECORD;
  v_receiver_profile RECORD;
  v_couple_id UUID;
  v_relationship_name TEXT;
BEGIN
  IF v_receiver_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to accept invitation';
  END IF;

  -- 1. Fetch invitation
  SELECT * INTO v_invite
  FROM public.invitations
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  IF v_invite.status <> 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer pending (status: %)', v_invite.status;
  END IF;

  IF v_invite.expires_at < NOW() THEN
    UPDATE public.invitations SET status = 'expired' WHERE id = v_invite.id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  IF v_invite.sender_id = v_receiver_id THEN
    RAISE EXCEPTION 'You cannot accept your own invitation';
  END IF;

  -- 2. Fetch sender profile
  SELECT * INTO v_sender_profile FROM public.profiles WHERE id = v_invite.sender_id;
  IF v_sender_profile.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'Sender already has a partner';
  END IF;

  -- 3. Fetch receiver profile
  SELECT * INTO v_receiver_profile FROM public.profiles WHERE id = v_receiver_id;
  IF v_receiver_profile.partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'You already have a partner';
  END IF;

  -- 4. Create Couple record
  v_relationship_name := COALESCE(v_sender_profile.display_name, 'Partner 1') || ' & ' || COALESCE(v_receiver_profile.display_name, 'Partner 2');

  INSERT INTO public.couples (
    relationship_name,
    anniversary,
    status,
    created_by
  ) VALUES (
    v_relationship_name,
    COALESCE(p_anniversary, CURRENT_DATE),
    'active',
    v_invite.sender_id
  ) RETURNING id INTO v_couple_id;

  -- 5. Update profiles to link partner_id & relationship_status
  UPDATE public.profiles
  SET partner_id = v_receiver_id,
      relationship_status = 'coupled'
  WHERE id = v_invite.sender_id;

  UPDATE public.profiles
  SET partner_id = v_invite.sender_id,
      relationship_status = 'coupled'
  WHERE id = v_receiver_id;

  -- 6. Update invitation status
  UPDATE public.invitations
  SET status = 'accepted',
      receiver_id = v_receiver_id,
      couple_id = v_couple_id,
      accepted_at = NOW()
  WHERE id = v_invite.id;

  -- 7. Cancel all other pending invitations involving sender or receiver
  UPDATE public.invitations
  SET status = 'cancelled'
  WHERE status = 'pending'
    AND id <> v_invite.id
    AND (sender_id IN (v_invite.sender_id, v_receiver_id) OR receiver_id IN (v_invite.sender_id, v_receiver_id));

  -- 8. Return created couple info
  RETURN jsonb_build_object(
    'couple_id', v_couple_id,
    'sender_id', v_invite.sender_id,
    'receiver_id', v_receiver_id,
    'status', 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop legacy signature for leave_relationship
DROP FUNCTION IF EXISTS public.leave_relationship(UUID);

CREATE OR REPLACE FUNCTION public.leave_relationship()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_profile RECORD;
  v_partner_id UUID;
  v_couple_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to leave relationship';
  END IF;

  SELECT * INTO v_user_profile FROM public.profiles WHERE id = v_user_id;
  IF v_user_profile.partner_id IS NULL THEN
    RAISE EXCEPTION 'You are not currently in a relationship';
  END IF;

  v_partner_id := v_user_profile.partner_id;

  -- Find active couple for user
  SELECT id INTO v_couple_id
  FROM public.couples
  WHERE (created_by = v_user_id OR created_by = v_partner_id)
    AND status = 'active'
  LIMIT 1;

  -- Update couple status to ended
  IF v_couple_id IS NOT NULL THEN
    UPDATE public.couples
    SET status = 'ended'
    WHERE id = v_couple_id;
  END IF;

  -- Reset profiles
  UPDATE public.profiles
  SET partner_id = NULL,
      relationship_status = 'single'
  WHERE id IN (v_user_id, v_partner_id);

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'former_partner_id', v_partner_id,
    'couple_id', v_couple_id,
    'status', 'ended'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 3. Update search_path for Triggers & Handlers (C5)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.profile_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Deduplicated Proposal Activity Trigger Function (M4, C5)
CREATE OR REPLACE FUNCTION public.log_proposal_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
  v_title TEXT;
  v_metadata JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_actor_id := NEW.created_by;
    v_title := 'Proposed: ' || NEW.title;
    v_metadata := jsonb_build_object(
      'proposal_id', NEW.id,
      'status', NEW.status,
      'start_datetime', COALESCE(NEW.start_datetime, NEW.planned_date)
    );
    INSERT INTO public.activity_logs (couple_id, actor_id, activity_type, title, metadata)
    VALUES (NEW.couple_id, v_actor_id, 'proposal_created', v_title, v_metadata);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_actor_id := auth.uid();
    v_title := 'Proposal ' || NEW.status || ': ' || NEW.title;
    v_metadata := jsonb_build_object(
      'proposal_id', NEW.id,
      'old_status', OLD.status,
      'new_status', NEW.status
    );
    INSERT INTO public.activity_logs (couple_id, actor_id, activity_type, title, metadata)
    VALUES (NEW.couple_id, v_actor_id, 'proposal_updated', v_title, v_metadata);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 4. Storage Bucket & Policy Hardening (C3, H3)
-- -----------------------------------------------------------------------------

-- Make buckets public for permanent URLs
UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'memories', 'proposal-images');

-- Drop old un-scoped storage policies
DROP POLICY IF EXISTS "Users can manage avatars storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage memories storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage proposal images storage" ON storage.objects;

-- Avatars Policies
DROP POLICY IF EXISTS "Avatars select" ON storage.objects;
CREATE POLICY "Avatars select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars insert" ON storage.objects;
CREATE POLICY "Avatars insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Avatars update" ON storage.objects;
CREATE POLICY "Avatars update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Avatars delete" ON storage.objects;
CREATE POLICY "Avatars delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Memories Storage Policies
DROP POLICY IF EXISTS "Memories select" ON storage.objects;
CREATE POLICY "Memories select" ON storage.objects
  FOR SELECT USING (bucket_id = 'memories');

DROP POLICY IF EXISTS "Memories insert" ON storage.objects;
CREATE POLICY "Memories insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories' AND auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_member_of_couple((storage.foldername(name))[1]::uuid)
    )
  );

DROP POLICY IF EXISTS "Memories update" ON storage.objects;
CREATE POLICY "Memories update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'memories' AND auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_member_of_couple((storage.foldername(name))[1]::uuid)
    )
  );

DROP POLICY IF EXISTS "Memories delete" ON storage.objects;
CREATE POLICY "Memories delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memories' AND auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_member_of_couple((storage.foldername(name))[1]::uuid)
    )
  );

-- Proposal Images Storage Policies
DROP POLICY IF EXISTS "Proposal images select" ON storage.objects;
CREATE POLICY "Proposal images select" ON storage.objects
  FOR SELECT USING (bucket_id = 'proposal-images');

DROP POLICY IF EXISTS "Proposal images insert" ON storage.objects;
CREATE POLICY "Proposal images insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proposal-images' AND auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_member_of_couple((storage.foldername(name))[1]::uuid)
    )
  );

DROP POLICY IF EXISTS "Proposal images update" ON storage.objects;
CREATE POLICY "Proposal images update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'proposal-images' AND auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_member_of_couple((storage.foldername(name))[1]::uuid)
    )
  );

DROP POLICY IF EXISTS "Proposal images delete" ON storage.objects;
CREATE POLICY "Proposal images delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'proposal-images' AND auth.uid() IS NOT NULL AND (
      (storage.foldername(name))[1] = auth.uid()::text OR public.is_member_of_couple((storage.foldername(name))[1]::uuid)
    )
  );

-- -----------------------------------------------------------------------------
-- 5. RLS Policy Fixes & Privacy Enforcement (C4, H1, H2, M2)
-- -----------------------------------------------------------------------------

-- 5.1 Memory Albums Policies (C4)
DROP POLICY IF EXISTS "Couple members can select memory_albums" ON public.memory_albums;
DROP POLICY IF EXISTS "Couple members can insert memory_albums" ON public.memory_albums;
DROP POLICY IF EXISTS "Couple members can update memory_albums" ON public.memory_albums;
DROP POLICY IF EXISTS "Couple members can delete memory_albums" ON public.memory_albums;

CREATE POLICY "Couple members can select memory_albums" ON public.memory_albums
  FOR SELECT USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can insert memory_albums" ON public.memory_albums
  FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update memory_albums" ON public.memory_albums
  FOR UPDATE USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can delete memory_albums" ON public.memory_albums
  FOR DELETE USING (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

-- 5.2 Memories RLS Policies (C4, H1, H2)
DROP POLICY IF EXISTS "Users can access memories for their couple" ON public.memories;
DROP POLICY IF EXISTS "Couple members can select memories" ON public.memories;
DROP POLICY IF EXISTS "Couple members can insert memories" ON public.memories;
DROP POLICY IF EXISTS "Couple members can update memories" ON public.memories;
DROP POLICY IF EXISTS "Couple members can delete memories" ON public.memories;

CREATE POLICY "Couple members can select memories" ON public.memories
  FOR SELECT USING (
    created_by = auth.uid() OR
    uploaded_by = auth.uid() OR
    (COALESCE(is_private, FALSE) = FALSE AND COALESCE(visibility, 'couple') != 'private' AND public.is_member_of_couple(couple_id))
  );

CREATE POLICY "Couple members can insert memories" ON public.memories
  FOR INSERT WITH CHECK (
    public.is_member_of_couple(couple_id) AND
    (created_by = auth.uid() OR uploaded_by = auth.uid())
  );

CREATE POLICY "Couple members can update memories" ON public.memories
  FOR UPDATE USING (
    public.is_member_of_couple(couple_id) AND
    (created_by = auth.uid() OR uploaded_by = auth.uid())
  );

CREATE POLICY "Couple members can delete memories" ON public.memories
  FOR DELETE USING (
    public.is_member_of_couple(couple_id) AND
    (created_by = auth.uid() OR uploaded_by = auth.uid())
  );

-- 5.3 Memory Comments & Reactions RLS (C4, H1)
DROP POLICY IF EXISTS "Couple members can select memory_comments" ON public.memory_comments;
DROP POLICY IF EXISTS "Couple members can insert memory_comments" ON public.memory_comments;
DROP POLICY IF EXISTS "Couple members can update memory_comments" ON public.memory_comments;
DROP POLICY IF EXISTS "Couple members can delete memory_comments" ON public.memory_comments;

CREATE POLICY "Couple members can select memory_comments" ON public.memory_comments
  FOR SELECT USING (
    memory_id IN (
      SELECT m.id FROM public.memories m
      WHERE m.created_by = auth.uid() OR m.uploaded_by = auth.uid() OR
            (COALESCE(m.is_private, FALSE) = FALSE AND COALESCE(m.visibility, 'couple') != 'private' AND public.is_member_of_couple(m.couple_id))
    )
  );

CREATE POLICY "Couple members can insert memory_comments" ON public.memory_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    memory_id IN (SELECT m.id FROM public.memories m WHERE public.is_member_of_couple(m.couple_id))
  );

CREATE POLICY "Couple members can update memory_comments" ON public.memory_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Couple members can delete memory_comments" ON public.memory_comments
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Couple members can select memory_reactions" ON public.memory_reactions;
DROP POLICY IF EXISTS "Couple members can insert memory_reactions" ON public.memory_reactions;
DROP POLICY IF EXISTS "Couple members can delete memory_reactions" ON public.memory_reactions;

CREATE POLICY "Couple members can select memory_reactions" ON public.memory_reactions
  FOR SELECT USING (
    memory_id IN (
      SELECT m.id FROM public.memories m
      WHERE m.created_by = auth.uid() OR m.uploaded_by = auth.uid() OR
            (COALESCE(m.is_private, FALSE) = FALSE AND COALESCE(m.visibility, 'couple') != 'private' AND public.is_member_of_couple(m.couple_id))
    )
  );

CREATE POLICY "Couple members can insert memory_reactions" ON public.memory_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    memory_id IN (SELECT m.id FROM public.memories m WHERE public.is_member_of_couple(m.couple_id))
  );

CREATE POLICY "Couple members can delete memory_reactions" ON public.memory_reactions
  FOR DELETE USING (user_id = auth.uid());

-- 5.4 Relationship Milestones RLS (C4, H1)
DROP POLICY IF EXISTS "Couple members can select relationship_milestones" ON public.relationship_milestones;
DROP POLICY IF EXISTS "Couple members can insert relationship_milestones" ON public.relationship_milestones;
DROP POLICY IF EXISTS "Couple members can update relationship_milestones" ON public.relationship_milestones;
DROP POLICY IF EXISTS "Couple members can delete relationship_milestones" ON public.relationship_milestones;

CREATE POLICY "Couple members can select relationship_milestones" ON public.relationship_milestones
  FOR SELECT USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can insert relationship_milestones" ON public.relationship_milestones
  FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update relationship_milestones" ON public.relationship_milestones
  FOR UPDATE USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can delete relationship_milestones" ON public.relationship_milestones
  FOR DELETE USING (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

-- 5.5 Proposals Policies (H1, H2)
DROP POLICY IF EXISTS "Users can access proposals for their couple" ON public.proposals;
DROP POLICY IF EXISTS "Proposals select policy" ON public.proposals;
DROP POLICY IF EXISTS "Proposals insert policy" ON public.proposals;
DROP POLICY IF EXISTS "Proposals update policy" ON public.proposals;
DROP POLICY IF EXISTS "Proposals delete policy" ON public.proposals;

CREATE POLICY "Proposals select policy" ON public.proposals
  FOR SELECT USING (
    created_by = auth.uid() OR
    (COALESCE(visibility, 'couple') != 'private' AND public.is_member_of_couple(couple_id))
  );

CREATE POLICY "Proposals insert policy" ON public.proposals
  FOR INSERT WITH CHECK (
    public.is_member_of_couple(couple_id) AND created_by = auth.uid()
  );

CREATE POLICY "Proposals update policy" ON public.proposals
  FOR UPDATE USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Proposals delete policy" ON public.proposals
  FOR DELETE USING (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

-- 5.6 Statuses Policies (H1)
DROP POLICY IF EXISTS "Users can access statuses of their couple or self" ON public.statuses;
DROP POLICY IF EXISTS "Statuses select policy" ON public.statuses;
DROP POLICY IF EXISTS "Statuses insert policy" ON public.statuses;
DROP POLICY IF EXISTS "Statuses update policy" ON public.statuses;
DROP POLICY IF EXISTS "Statuses delete policy" ON public.statuses;

CREATE POLICY "Statuses select policy" ON public.statuses
  FOR SELECT USING (
    user_id = auth.uid() OR (couple_id IS NOT NULL AND public.is_member_of_couple(couple_id))
  );

CREATE POLICY "Statuses insert policy" ON public.statuses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Statuses update policy" ON public.statuses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Statuses delete policy" ON public.statuses
  FOR DELETE USING (user_id = auth.uid());

-- 5.7 Plans Policies (H1)
DROP POLICY IF EXISTS "Users can access plans for their couple" ON public.plans;
DROP POLICY IF EXISTS "Plans select policy" ON public.plans;
DROP POLICY IF EXISTS "Plans insert policy" ON public.plans;
DROP POLICY IF EXISTS "Plans update policy" ON public.plans;
DROP POLICY IF EXISTS "Plans delete policy" ON public.plans;

CREATE POLICY "Plans select policy" ON public.plans
  FOR SELECT USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Plans insert policy" ON public.plans
  FOR INSERT WITH CHECK (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

CREATE POLICY "Plans update policy" ON public.plans
  FOR UPDATE USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Plans delete policy" ON public.plans
  FOR DELETE USING (public.is_member_of_couple(couple_id));

-- 5.8 Invitations Policies (M2 enumeration fix)
DROP POLICY IF EXISTS "Users can access invitations sent or received by them" ON public.invitations;
CREATE POLICY "Users can access invitations sent or received by them" ON public.invitations
  FOR ALL USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = sender_id
  );

-- -----------------------------------------------------------------------------
-- 6. Realtime REPLICA IDENTITY FULL (M3)
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.couples REPLICA IDENTITY FULL;
ALTER TABLE public.invitations REPLICA IDENTITY FULL;
ALTER TABLE public.statuses REPLICA IDENTITY FULL;
ALTER TABLE public.plans REPLICA IDENTITY FULL;
ALTER TABLE public.proposals REPLICA IDENTITY FULL;
ALTER TABLE public.memories REPLICA IDENTITY FULL;
ALTER TABLE public.memory_albums REPLICA IDENTITY FULL;
ALTER TABLE public.memory_comments REPLICA IDENTITY FULL;
ALTER TABLE public.memory_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.relationship_milestones REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
