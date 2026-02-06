-- Definitive fix for "invalid input syntax for type uuid" on invite accept.
-- Ensures invites.token is TEXT and RPCs compare as text only (no UUID cast).

-- 1. Ensure token column is text (no-op if already text)
DO $$
BEGIN
  IF (
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'token'
  ) IS NOT NULL AND (
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'token'
  ) <> 'text' THEN
    ALTER TABLE public.invites
      ALTER COLUMN token TYPE text USING token::text;
  END IF;
END
$$;

-- 2. Drop all accept_invite overloads to avoid any PostgREST/parameter confusion
DROP FUNCTION IF EXISTS public.accept_invite(text);
DROP FUNCTION IF EXISTS public.accept_invite(text, text, text, text);

-- 3. Create single accept_invite: text-only comparison so param is never cast to UUID
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

  SELECT * INTO v_invite FROM invites WHERE (token)::text = invite_token AND accepted_at IS NULL;
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

-- 4. get_invite_by_token: text-only comparison
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
  WHERE (i.token)::text = invite_token;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;
