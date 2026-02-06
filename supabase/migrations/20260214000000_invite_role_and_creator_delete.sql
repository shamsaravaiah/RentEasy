-- Two-party flow: invite returns minimal for anon (no contract details), full + role for auth.
-- Only contract creator can delete.

-- 1. get_invite_by_token: anon gets only inviter_name + contract_id; authenticated gets full + role
CREATE OR REPLACE FUNCTION public.get_invite_by_token(invite_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  v_uid uuid;
  v_invite invites%ROWTYPE;
  v_role text;
BEGIN
  v_uid := auth.uid();

  SELECT * INTO v_invite
  FROM invites i
  WHERE (i.token)::text = invite_token;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_uid IS NULL THEN
    -- Unauthenticated: return only creator name and contract_id (no contract details)
    SELECT json_build_object(
      'inviter_name', COALESCE(p.full_name, 'Someone'),
      'contract_id', v_invite.contract_id
    ) INTO result
    FROM profiles p
    WHERE p.id = v_invite.invited_by;
    IF result IS NULL THEN
      result := json_build_object('inviter_name', 'Someone', 'contract_id', v_invite.contract_id);
    END IF;
    RETURN result;
  END IF;

  -- Authenticated: determine role (creator | invitee | other)
  IF EXISTS (SELECT 1 FROM contracts WHERE id = v_invite.contract_id AND created_by = v_uid) THEN
    v_role := 'creator';
  ELSIF EXISTS (
    SELECT 1 FROM contract_parties
    WHERE contract_id = v_invite.contract_id AND user_id = v_uid
  ) THEN
    v_role := 'invitee';
  ELSE
    v_role := 'other';
  END IF;

  SELECT json_build_object(
    'inviter_name', COALESCE(p.full_name, 'Someone'),
    'contract_id', v_invite.contract_id,
    'address', c.address,
    'rent', c.rent,
    'start_date', c.start_date,
    'end_date', c.end_date,
    'role', v_role,
    'accepted_at', v_invite.accepted_at
  ) INTO result
  FROM invites i
  JOIN contracts c ON c.id = i.contract_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.id = v_invite.id;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;

-- 2. Only contract creator can delete (draft or waiting only)
DROP POLICY IF EXISTS "Users can delete draft or waiting contracts they have access to" ON public.contracts;

CREATE POLICY "Only creator can delete draft or waiting contracts"
  ON public.contracts FOR DELETE
  USING (
    created_by = auth.uid()
    AND status IN ('draft', 'waiting')
  );
