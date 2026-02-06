-- Allow users to delete contracts they created or are party to (draft or waiting only)

CREATE POLICY "Users can delete draft or waiting contracts they have access to"
  ON public.contracts FOR DELETE
  USING (
    id IN (SELECT get_accessible_contract_ids())
    AND status IN ('draft', 'waiting')
  );
