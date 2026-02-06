-- RentEasy: contracts schema migration
-- Run via Supabase: supabase db push (or paste in SQL Editor)

-- =============================================================================
-- 1. Profiles (extends auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  full_name     text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. Contracts
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address         text NOT NULL,
  start_date      date NOT NULL,
  end_date        date NOT NULL,
  rent            integer NOT NULL,
  deposit         integer,
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'waiting', 'signed', 'completed')),
  created_by      uuid NOT NULL REFERENCES public.profiles(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- =============================================================================
-- 3. Contract parties (landlord + tenant per contract)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.contract_parties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  role            text NOT NULL CHECK (role IN ('landlord', 'tenant')),
  email           text,
  full_name       text,
  verified_at     timestamptz,
  signed_at       timestamptz,
  UNIQUE(contract_id, role)
);

-- =============================================================================
-- Enable RLS and policies (after all tables exist)
-- =============================================================================
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contracts they created or are party to"
  ON public.contracts FOR SELECT
  USING (
    created_by = auth.uid()
    OR id IN (
      SELECT contract_id FROM public.contract_parties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own contracts"
  ON public.contracts FOR UPDATE
  USING (created_by = auth.uid());

ALTER TABLE public.contract_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view parties for accessible contracts"
  ON public.contract_parties FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM public.contracts WHERE created_by = auth.uid()
      UNION
      SELECT contract_id FROM public.contract_parties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Contract creator can insert parties"
  ON public.contract_parties FOR INSERT
  WITH CHECK (
    contract_id IN (SELECT id FROM public.contracts WHERE created_by = auth.uid())
  );

CREATE POLICY "Contract creator or party can update"
  ON public.contract_parties FOR UPDATE
  USING (
    user_id = auth.uid()
    OR contract_id IN (SELECT id FROM public.contracts WHERE created_by = auth.uid())
  );

-- =============================================================================
-- 4. Invites
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  token           text UNIQUE NOT NULL,
  email           text,
  role            text NOT NULL CHECK (role IN ('landlord', 'tenant')),
  invited_by      uuid NOT NULL REFERENCES public.profiles(id),
  accepted_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invite by token"
  ON public.invites FOR SELECT
  USING (true);

CREATE POLICY "Contract creator can insert invites"
  ON public.invites FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND contract_id IN (SELECT id FROM public.contracts WHERE created_by = auth.uid())
  );

CREATE POLICY "Invitee can update to accept"
  ON public.invites FOR UPDATE
  USING (true);

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON public.contracts(created_by);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_parties_contract_id ON public.contract_parties(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_parties_user_id ON public.contract_parties(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_contract_id ON public.invites(contract_id);
