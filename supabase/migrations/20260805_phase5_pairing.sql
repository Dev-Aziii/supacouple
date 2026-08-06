-- Phase 5 Migration: Couple Pairing & Invitation System RPCs & Security

-- -----------------------------------------------------------------------------
-- 1. Atomic Accept Invitation Transaction Function
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

  -- 8. Return created couple info
  RETURN jsonb_build_object(
    'couple_id', v_couple_id,
    'sender_id', v_invite.sender_id,
    'receiver_id', v_receiver_id,
    'status', 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 2. Atomic Leave Relationship Function
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

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'former_partner_id', v_partner_id,
    'couple_id', v_couple_id,
    'status', 'ended'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
