-- Migration: Fix Partner Invitation & In-App Notifications
-- Description: Adds DB triggers to auto-link receiver_id and create notifications on invitations/registrations, updates notifications RLS, and embeds notification creation in SECURITY DEFINER RPCs.

-- -----------------------------------------------------------------------------
-- 1. Notifications RLS Policy Hardening
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can access their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

-- SELECT policy: Users can read notifications addressed to them
CREATE POLICY "Users can select own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

-- UPDATE policy: Users can update read status on notifications addressed to them
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- DELETE policy: Users can delete notifications addressed to them
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (recipient_id = auth.uid());

-- INSERT policy: Authenticated users can insert notifications if they are the sender or recipient
CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 2. Trigger: Before Insert on Invitations (Auto-link receiver_id if profile exists)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_invitation_before_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
BEGIN
  -- Normalize email
  NEW.email := LOWER(TRIM(NEW.email));

  -- Look up matching profile if user is already registered
  SELECT id INTO v_recipient_id
  FROM public.profiles
  WHERE LOWER(email) = NEW.email;

  IF v_recipient_id IS NOT NULL THEN
    NEW.receiver_id := v_recipient_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_invitation_before_insert ON public.invitations;
CREATE TRIGGER trg_invitation_before_insert
  BEFORE INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invitation_before_insert();

-- -----------------------------------------------------------------------------
-- 3. Trigger: After Insert on Invitations (Create notification if receiver is known)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_invitation_after_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  -- Only create notification if receiver_id is known and status is pending
  IF NEW.receiver_id IS NOT NULL AND NEW.status = 'pending' THEN
    SELECT COALESCE(display_name, 'Someone') INTO v_sender_name
    FROM public.profiles
    WHERE id = NEW.sender_id;

    INSERT INTO public.notifications (
      recipient_id,
      sender_id,
      type,
      title,
      body,
      read
    ) VALUES (
      NEW.receiver_id,
      NEW.sender_id,
      'invite',
      'New Couple Invitation',
      v_sender_name || ' sent you a couple invitation!',
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_invitation_after_insert ON public.invitations;
CREATE TRIGGER trg_invitation_after_insert
  AFTER INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invitation_after_insert();

-- -----------------------------------------------------------------------------
-- 4. Trigger: After Insert on Profiles (Link invitations & create notification for new signups)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_link_invitations()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_sender_name TEXT;
BEGIN
  -- Search for active pending invitations for this new user's email
  FOR v_invitation IN
    SELECT * FROM public.invitations
    WHERE LOWER(email) = LOWER(NEW.email)
      AND status = 'pending'
      AND expires_at > NOW()
  LOOP
    -- Link receiver_id
    UPDATE public.invitations
    SET receiver_id = NEW.id
    WHERE id = v_invitation.id;

    -- Get sender display name
    SELECT COALESCE(display_name, 'Someone') INTO v_sender_name
    FROM public.profiles
    WHERE id = v_invitation.sender_id;

    -- Insert in-app notification for the newly registered user
    INSERT INTO public.notifications (
      recipient_id,
      sender_id,
      type,
      title,
      body,
      read
    ) VALUES (
      NEW.id,
      v_invitation.sender_id,
      'invite',
      'New Couple Invitation',
      v_sender_name || ' sent you a couple invitation!',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_new_user_link_invitations ON public.profiles;
CREATE TRIGGER trg_new_user_link_invitations
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_link_invitations();

-- -----------------------------------------------------------------------------
-- 5. Updated RPC: accept_couple_invite (Includes In-App Notification Delivery)
-- -----------------------------------------------------------------------------
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

  -- 8. Create in-app notification for sender
  INSERT INTO public.notifications (
    recipient_id,
    sender_id,
    type,
    title,
    body,
    read
  ) VALUES (
    v_invite.sender_id,
    v_receiver_id,
    'invite',
    'Invitation Accepted! 💕',
    COALESCE(v_receiver_profile.display_name, 'Your partner') || ' accepted your couple invitation!',
    false
  );

  -- 9. Return created couple info
  RETURN jsonb_build_object(
    'couple_id', v_couple_id,
    'relationship_name', v_relationship_name,
    'partner_id', v_invite.sender_id,
    'status', 'coupled'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 6. Updated RPC: leave_relationship (Includes In-App Notification Delivery)
-- -----------------------------------------------------------------------------
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

  -- Send notification to former partner
  INSERT INTO public.notifications (
    recipient_id,
    sender_id,
    type,
    title,
    body,
    read
  ) VALUES (
    v_partner_id,
    v_user_id,
    'system',
    'Relationship Ended',
    COALESCE(v_user_profile.display_name, 'Your partner') || ' has left the relationship.',
    false
  );

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'former_partner_id', v_partner_id,
    'couple_id', v_couple_id,
    'status', 'ended'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
