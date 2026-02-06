-- RPC to fetch invite details by token (for unauthenticated invite landing page)
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
    'inviter_name', p.full_name,
    'address', c.address,
    'rent', c.rent,
    'start_date', c.start_date,
    'end_date', c.end_date,
    'contract_id', c.id
  ) INTO result
  FROM invites i
  JOIN contracts c ON c.id = i.contract_id
  JOIN profiles p ON p.id = i.invited_by
  WHERE i.token = invite_token;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;
