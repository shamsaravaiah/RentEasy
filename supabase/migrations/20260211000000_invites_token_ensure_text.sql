-- Ensure invites.token is TEXT so lookups by invite link (16-char hex) never cast to UUID.
-- If the column was ever created as UUID, this fixes "invalid input syntax for type uuid" when
-- opening links like /invite/sham.saravaiahgari (invalid token) or when token column was wrong type.
DO $$
BEGIN
  IF (
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'token'
  ) <> 'text' THEN
    ALTER TABLE public.invites
      ALTER COLUMN token TYPE text USING token::text;
  END IF;
END
$$;
