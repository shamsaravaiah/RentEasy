import { createClient } from "@/lib/supabase/client";
import type { ContractStatus } from "@/components/ContractStatusBadge";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INVITE_TOKEN_REGEX = /^[a-f0-9]{16}$/i;

function assertValidContractId(id: string): void {
  if (!UUID_REGEX.test(id)) {
    throw new Error("Invalid contract link");
  }
}

function assertValidInviteToken(token: string): void {
  if (!token || !INVITE_TOKEN_REGEX.test(token)) {
    throw new Error("Invalid invite link");
  }
}

/** Parse numeric string: spaces as thousands (e.g. "25 000"), comma as decimal or thousands (e.g. "25,5" or "25,000") */
function parseAmount(value: string): number {
  if (!value || !value.trim()) return 0;
  let s = value.trim().replace(/\s/g, "");
  if (/,/.test(s)) {
    const [before, after] = s.split(",");
    if (after !== undefined && after.length === 3 && /^\d+$/.test(after) && !/\./.test(before))
      s = before + after;
    else
      s = s.replace(",", ".");
  }
  return Number(s) || 0;
}

// Map DB snake_case to app camelCase (list row may include created_by for isCreator)
function mapContractRow(
  row: Record<string, unknown>,
  currentUserId?: string
) {
  const isCreator =
    currentUserId != null && (row.created_by as string) === currentUserId;
  return {
    id: row.id as string,
    address: row.address as string,
    status: (row.status as ContractStatus) ?? "draft",
    rent: Number(row.rent) ?? 0,
    startDate: (row.start_date as string) ?? "",
    endDate: (row.end_date as string) ?? "",
    ...(currentUserId != null && { isCreator }),
  };
}

export const api = {
  auth: {
    startBankID: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true, redirectUrl: "https://mock-bankid.com" };
    },
    verifyCallback: async (code: string) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return {
        success: true,
        user: {
          name: "Anna Andersson",
          personalNumber: "19800101-1234",
          verifiedAt: new Date().toISOString(),
        },
      };
    },
    logout: async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      return { success: true };
    },
  },
  contracts: {
    list: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      const user = data.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from("contracts")
        .select("id, address, start_date, end_date, rent, status, created_by")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => mapContractRow(row, user.id));
    },
    get: async (id: string) => {
      assertValidContractId(id);
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      const user = data.user;
      if (!user) throw new Error("Not authenticated");

      const { data: contract, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (contractError) throw new Error(contractError.message);
      if (!contract) throw new Error("Contract not found");

      const { data: parties } = await supabase
        .from("contract_parties")
        .select("role, full_name, verified_at, signed_at, user_id")
        .eq("contract_id", id);

      const landlordRow = parties?.find((p: { role: string }) => p.role === "landlord");
      const tenantRow = parties?.find((p: { role: string }) => p.role === "tenant");

      const myParty = parties?.find((p: { user_id: string | null }) => p.user_id === user.id);
      const role = (myParty?.role as "landlord" | "tenant") ?? "landlord";
      const isCreator = contract.created_by === user.id;

      const landlord = landlordRow
        ? {
            name: landlordRow.full_name ?? "—",
            verified: !!landlordRow.verified_at,
            signedAt: landlordRow.signed_at ? (landlordRow.signed_at as string) : undefined,
          }
        : undefined;
      const tenant = tenantRow
        ? {
            name: tenantRow.full_name ?? "—",
            verified: !!tenantRow.verified_at,
            signedAt: tenantRow.signed_at ? (tenantRow.signed_at as string) : undefined,
          }
        : undefined;

      const { count } = await supabase
        .from("invites")
        .select("id", { count: "exact", head: true })
        .eq("contract_id", id);

      let inviteLink: string | undefined;
      if (contract.created_by === user.id) {
        const { data: inviteRow } = await supabase
          .from("invites")
          .select("token")
          .eq("contract_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (inviteRow?.token) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          inviteLink = `${baseUrl}/invite/${inviteRow.token}`;
        }
      }

      return {
        id: contract.id,
        address: contract.address,
        startDate: contract.start_date,
        endDate: contract.end_date,
        rent: Number(contract.rent),
        deposit: contract.deposit ? Number(contract.deposit) : undefined,
        status: (contract.status as ContractStatus) ?? "draft",
        role,
        isCreator,
        landlord,
        tenant,
        hasInvitedParty: (count ?? 0) > 0,
        inviteLink,
      };
    },
    create: async (data: {
      role: string;
      address: string;
      startDate: string;
      endDate: string;
      rent: string;
      deposit?: string;
    }) => {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const user = authData.user;
      if (!user) throw new Error("Not authenticated");

      const profile = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const fullName =
        profile.data?.full_name ?? user.email?.split("@")[0] ?? "—";

      const rentNum = Math.round(parseAmount(data.rent));
      const depositNum = data.deposit && data.deposit.trim() ? Math.round(parseAmount(data.deposit)) : null;

      const { data: contractId, error } = await supabase.rpc("create_contract", {
        p_address: data.address,
        p_start_date: data.startDate,
        p_end_date: data.endDate,
        p_rent: rentNum,
        p_deposit: depositNum,
        p_role: data.role,
        p_full_name: fullName,
      });

      if (error || !contractId) throw new Error(error?.message ?? "Failed to create contract");

      return {
        id: contractId as string,
        address: data.address,
        startDate: data.startDate,
        endDate: data.endDate,
        rent: rentNum,
        deposit: depositNum ?? undefined,
        status: "draft" as const,
      };
    },
    sign: async (id: string) => {
      assertValidContractId(id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { orderRef: "mock-order-ref" };
    },
    checkSignStatus: async (orderRef: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const isDone = Math.random() > 0.3;
      return { status: isDone ? "complete" : "pending" };
    },
    recordSignature: async (contractId: string) => {
      assertValidContractId(contractId);
      const supabase = createClient();
      const { error } = await supabase.rpc("sign_contract", {
        p_contract_id: contractId,
      });
      if (error) throw new Error(error.message);
    },
    delete: async (id: string) => {
      assertValidContractId(id);
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      const user = data.user;
      if (!user) throw new Error("Not authenticated");

      const { data: deleted, error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) throw new Error(error.message);
      if (!deleted || deleted.length === 0) {
        throw new Error("Could not delete contract. Only draft or unsigned contracts can be deleted.");
      }
    },
  },
  invites: {
    /** Public (anon) returns only inviterName + contractId. Authenticated returns full details + role. */
    get: async (token: string) => {
      assertValidInviteToken(token);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_invite_by_token", {
        invite_token: token,
      });

      if (error) {
        const msg = error?.message ?? "Ogiltig länk";
        if (/invalid input syntax for type uuid/i.test(msg)) {
          throw new Error("Invalid invite link. Run database migrations (npx supabase db push) and try again.");
        }
        throw new Error(msg);
      }
      if (data == null) {
        throw new Error("Invalid invite link");
      }

      const inviterName = data.inviter_name ?? "—";
      const contractId = data.contract_id as string;

      if (data.role != null) {
        return {
          inviterName,
          contractId,
          address: data.address as string,
          rent: Number(data.rent),
          startDate: data.start_date as string,
          endDate: data.end_date as string,
          role: data.role as "creator" | "invitee" | "other",
          acceptedAt: data.accepted_at ? (data.accepted_at as string) : undefined,
        };
      }

      return { inviterName, contractId };
    },
    create: async (contractId: string, role: "landlord" | "tenant", email?: string) => {
      assertValidContractId(contractId);
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      const user = data.user;
      if (!user) throw new Error("Not authenticated");

      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

      const { error } = await supabase.from("invites").insert({
        contract_id: contractId,
        token,
        email: email ?? null,
        role,
        invited_by: user.id,
      });

      if (error) throw new Error(error.message);

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      return { inviteLink: `${baseUrl}/invite/${token}`, token };
    },
    accept: async (
      token: string,
      details?: { fullName?: string; email?: string; phone?: string }
    ) => {
      assertValidInviteToken(token);
      const supabase = createClient();
      const { data: contractId, error } = await supabase.rpc("accept_invite", {
        invite_token: token,
        p_full_name: details?.fullName ?? null,
        p_email: details?.email ?? null,
        p_phone: details?.phone ?? null,
      });

      if (error || !contractId) {
        const msg = error?.message ?? "Could not accept invite";
        if (/invalid input syntax for type uuid/i.test(msg)) {
          throw new Error("Invalid invite link. Run database migrations (npx supabase db push) and try again.");
        }
        throw new Error(msg);
      }
      return contractId as string;
    },
  },
};
