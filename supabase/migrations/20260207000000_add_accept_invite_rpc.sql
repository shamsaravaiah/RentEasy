-- RPC to accept an invite: add user as the other party and mark invite as accepted
CREATE OR REPLACE FUNCTION public.accept_invite(invite_token text)
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

  SELECT full_name INTO v_profile FROM profiles WHERE id = v_user_id;

  UPDATE contract_parties
  SET user_id = v_user_id, full_name = COALESCE(v_profile.full_name, '—'), verified_at = now()
  WHERE contract_id = v_invite.contract_id AND role = v_invite.role;

  UPDATE invites SET accepted_at = now() WHERE id = v_invite.id;

  UPDATE contracts SET status = 'waiting' WHERE id = v_invite.contract_id AND status = 'draft';

  RETURN v_invite.contract_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO authenticated;
