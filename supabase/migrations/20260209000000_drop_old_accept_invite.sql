-- Drop the old 1-param accept_invite overload to avoid PostgREST parameter confusion.
-- We only want the 4-param version (invite_token, p_full_name, p_email, p_phone).
DROP FUNCTION IF EXISTS public.accept_invite(text);
