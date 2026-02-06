-- Fix RLS recursion and add create_contract RPC for reliable inserts

-- 1. Create helper function (fixes infinite recursion on SELECT)
CREATE OR REPLACE FUNCTION public.get_accessible_contract_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.contracts WHERE created_by = auth.uid()
  UNION
  SELECT contract_id FROM public.contract_parties WHERE user_id = auth.uid();
$$;

-- 2. Drop and recreate SELECT policies (non-recursive)
DROP POLICY IF EXISTS "Users can view contracts they created or are party to" ON public.contracts;
DROP POLICY IF EXISTS "Users can view parties for accessible contracts" ON public.contract_parties;

CREATE POLICY "Users can view contracts they created or are party to"
  ON public.contracts FOR SELECT
  USING (id IN (SELECT get_accessible_contract_ids()));

CREATE POLICY "Users can view parties for accessible contracts"
  ON public.contract_parties FOR SELECT
  USING (contract_id IN (SELECT get_accessible_contract_ids()));

-- 3. Fix contract_parties INSERT policy (use helper to avoid recursion)
DROP POLICY IF EXISTS "Contract creator can insert parties" ON public.contract_parties;

CREATE POLICY "Contract creator can insert parties"
  ON public.contract_parties FOR INSERT
  WITH CHECK (contract_id IN (SELECT get_accessible_contract_ids()));

-- 4. Fix contract_parties UPDATE policy
DROP POLICY IF EXISTS "Contract creator or party can update" ON public.contract_parties;

CREATE POLICY "Contract creator or party can update"
  ON public.contract_parties FOR UPDATE
  USING (
    user_id = auth.uid()
    OR contract_id IN (SELECT get_accessible_contract_ids())
  );

-- 5. Fix invites INSERT policy
DROP POLICY IF EXISTS "Contract creator can insert invites" ON public.invites;

CREATE POLICY "Contract creator can insert invites"
  ON public.invites FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND contract_id IN (SELECT get_accessible_contract_ids())
  );

-- 6. RPC to create contract (bypasses RLS for INSERT, ensures auth works)
CREATE OR REPLACE FUNCTION public.create_contract(
  p_address text,
  p_start_date date,
  p_end_date date,
  p_rent integer,
  p_role text,
  p_full_name text,
  p_deposit integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_contract_id uuid;
  v_other_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_other_role := CASE WHEN p_role = 'landlord' THEN 'tenant' ELSE 'landlord' END;

  INSERT INTO public.contracts (address, start_date, end_date, rent, deposit, status, created_by)
  VALUES (p_address, p_start_date, p_end_date, p_rent, p_deposit, 'draft', v_user_id)
  RETURNING id INTO v_contract_id;

  INSERT INTO public.contract_parties (contract_id, user_id, role, full_name, verified_at)
  VALUES (v_contract_id, v_user_id, p_role, p_full_name, now());

  INSERT INTO public.contract_parties (contract_id, role)
  VALUES (v_contract_id, v_other_role);

  RETURN v_contract_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_contract(text, date, date, integer, text, text, integer) TO authenticated;
