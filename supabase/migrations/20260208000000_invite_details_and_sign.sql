-- Add phone to contract_parties, update accept_invite, add sign_contract RPC
-- Also fix get_invite_by_token to use LEFT JOIN for profiles

-- 1. Add phone column to contract_parties
ALTER TABLE public.contract_parties ADD COLUMN IF NOT EXISTS phone text;

-- 2. Update accept_invite to accept party details
CREATE OR REPLACE FUNCTION public.accept_invite(
  invite_token text,
  p_full_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_invite invites%ROWTYPE;
  v_profile profiles%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_invite FROM invites WHERE token = invite_token AND accepted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already accepted invite';
  END IF;

  SELECT full_name, email INTO v_profile FROM profiles WHERE id = v_user_id;

  UPDATE contract_parties
  SET
    user_id = v_user_id,
    full_name = COALESCE(NULLIF(trim(p_full_name), ''), v_profile.full_name, '—'),
    email = COALESCE(NULLIF(trim(p_email), ''), v_profile.email),
    phone = NULLIF(trim(p_phone), ''),
    verified_at = now()
  WHERE contract_id = v_invite.contract_id AND role = v_invite.role;

  UPDATE invites SET accepted_at = now() WHERE id = v_invite.id;

  UPDATE contracts SET status = 'waiting' WHERE id = v_invite.contract_id AND status = 'draft';

  RETURN v_invite.contract_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invite(text, text, text, text) TO authenticated;

-- 3. Fix get_invite_by_token - use LEFT JOIN so it works when profile is missing
CREATE OR REPLACE FUNCTION public.get_invite_by_token(invite_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'inviter_name', COALESCE(p.full_name, 'Someone'),
    'address', c.address,
    'rent', c.rent,
    'start_date', c.start_date,
    'end_date', c.end_date,
    'contract_id', c.id
  ) INTO result
  FROM invites i
  JOIN contracts c ON c.id = i.contract_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.token = invite_token;
  RETURN result;
END;
$$;

-- 4. sign_contract RPC - record current user's signature
CREATE OR REPLACE FUNCTION public.sign_contract(p_contract_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_party_count int;
  v_signed_count int;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE contract_parties
  SET signed_at = now()
  WHERE contract_id = p_contract_id AND user_id = v_user_id AND signed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot sign: not a party to this contract or already signed';
  END IF;

  SELECT count(*), count(signed_at) INTO v_party_count, v_signed_count
  FROM contract_parties
  WHERE contract_id = p_contract_id AND user_id IS NOT NULL;

  IF v_party_count = v_signed_count THEN
    UPDATE contracts SET status = 'signed' WHERE id = p_contract_id AND status = 'waiting';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sign_contract(uuid) TO authenticated;
