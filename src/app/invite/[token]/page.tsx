"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  Loader2,
  Home,
  Calendar,
  CreditCard,
  PenLine,
  AlertTriangle,
  User,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { ContractStatusBadge } from "@/components/ContractStatusBadge";
import type { ContractStatus } from "@/components/ContractStatusBadge";
import { EmailAuthModal } from "@/components/EmailAuthModal";

const INVITE_TOKEN_REGEX = /^[a-f0-9]{16}$/i;

type InviteData =
  | { inviterName: string; contractId: string }
  | {
      inviterName: string;
      contractId: string;
      address: string;
      rent: number;
      startDate: string;
      endDate: string;
      role: "creator" | "invitee" | "other";
      acceptedAt?: string;
    };

type Contract = {
  id: string;
  address: string;
  startDate: string;
  endDate: string;
  rent: number;
  deposit?: number;
  status: ContractStatus;
  role: "landlord" | "tenant";
  isCreator: boolean;
  landlord?: { name: string; verified: boolean; signedAt?: string };
  tenant?: { name: string; verified: boolean; signedAt?: string };
};

export default function InviteLandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [signing, setSigning] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const acceptedRedirect = useRef(false);
  const didAutoOpenModal = useRef(false);
  const refreshAfterAuthRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const run = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      setLoadError(null);
      setAcceptError(null);
      if (!token || !INVITE_TOKEN_REGEX.test(token)) {
        setLoadError("Invalid invite link");
        setLoading(false);
        return;
      }

      try {
        const data = await api.invites.get(token);
        setInvite(data);

        if (!user) {
          setLoading(false);
          return;
        }

        const hasFullInvite = "role" in data;
        if (!hasFullInvite) {
          setLoading(false);
          return;
        }

        const fullData = data as Extract<InviteData, { role: string }>;

        if (fullData.role === "creator") {
          router.replace(`/contracts/${fullData.contractId}`);
          return;
        }

        if (fullData.role === "other" && !fullData.acceptedAt) {
          if (acceptedRedirect.current) {
            setLoading(false);
            return;
          }
          acceptedRedirect.current = true;
          setAccepting(true);
          try {
            const profile = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", user.id)
              .single();
            const fullName =
              profile.data?.full_name ??
              user.user_metadata?.full_name ??
              user.email?.split("@")[0] ??
              undefined;
            const email = user.email ?? undefined;
            await api.invites.accept(token, {
              fullName: fullName ?? undefined,
              email: email ?? undefined,
            });
            // Redirect invitee to their home page so they see My contracts & Received contracts
            router.replace("/rentEasy");
            return;
          } catch (err) {
            console.error("Failed to accept invite", err);
            setAcceptError(
              err instanceof Error ? err.message : t("common.error")
            );
            setAccepting(false);
            setLoading(false);
            return;
          } finally {
            setAccepting(false);
          }
        }

        if (fullData.role === "other" && fullData.acceptedAt) {
          setLoading(false);
          return;
        }

        try {
          const c = await api.contracts.get(fullData.contractId);
          setContract(c as Contract);
        } catch (err) {
          console.error("Failed to load contract", err);
          setLoadError(err instanceof Error ? err.message : t("common.error"));
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load invite", err);
        setLoadError(err instanceof Error ? err.message : t("common.error"));
        setLoading(false);
      }
    };

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    refreshAfterAuthRef.current = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      const u = error ? null : data.user ?? null;
      if (u) await run(u);
    };

    const init = async () => {
      if (!token || !INVITE_TOKEN_REGEX.test(token)) return;

      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        if (u) {
          setLoading(true);
          run(u);
        }
      }).data.subscription;

      let user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;
      const first = await supabase.auth.getUser();
      if (!first.error) user = first.data.user ?? null;
      if (!user) {
        await new Promise((r) => setTimeout(r, 400));
        if (!mounted) return;
        const retry = await supabase.auth.getUser();
        if (!retry.error) user = retry.data.user ?? null;
      }

      await run(user);
    };

    init();
    return () => {
      mounted = false;
      refreshAfterAuthRef.current = null;
      subscription?.unsubscribe();
    };
  }, [token, t, router]);

  // Auto-open email auth when we show the sign-in view (user visited invite link not logged in)
  useEffect(() => {
    if (!invite || "role" in invite || didAutoOpenModal.current) return;
    didAutoOpenModal.current = true;
    setEmailModalOpen(true);
  }, [invite]);

  const handleSign = () => {
    if (!invite || !("contractId" in invite)) return;
    router.push(`/contracts/${invite.contractId}/sign`);
  };

  const inviteLink = `/auth?redirect=${encodeURIComponent(`/invite/${token}`)}`;
  const isCreator = invite && "role" in invite && invite.role === "creator";
  const isInvitee = invite && "role" in invite && invite.role === "invitee";
  const isOtherUsed =
    invite &&
    "role" in invite &&
    invite.role === "other" &&
    "acceptedAt" in invite &&
    !!invite.acceptedAt;
  const myPartySigned = contract
    ? contract.role === "landlord"
      ? !!contract.landlord?.signedAt
      : !!contract.tenant?.signedAt
    : false;
  const bothSigned = contract?.status === "signed" || contract?.status === "completed";
  const canSign = contract && isInvitee && !myPartySigned && !bothSigned;

  if (loading || accepting) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {accepting && (
          <p className="text-sm text-muted-foreground">
            {t("invite.acceptAndSign")}
          </p>
        )}
      </div>
    );
  }

  if (loadError || !invite) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mb-4 text-2xl font-bold">{t("common.somethingWentWrong")}</h1>
        <p className="mb-8 text-muted-foreground">
          {loadError ?? t("common.error")}
        </p>
        <PrimaryButton onClick={() => router.push("/")} variant="secondary">
          {t("common.back")}
        </PrimaryButton>
      </div>
    );
  }

  const inviterName = invite.inviterName;

  if (!("role" in invite)) {
    return (
      <>
        <div className="mx-auto flex max-w-lg flex-col gap-8 py-8 md:py-12">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">
              {inviterName} {t("invite.hasCreatedForYou")}
            </h1>
            <p className="text-muted-foreground">{t("invite.signInToView")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <PrimaryButton
              fullWidth
              className="h-14 text-lg"
              onClick={() => setEmailModalOpen(true)}
            >
              {t("invite.signUp")}
            </PrimaryButton>
            <PrimaryButton
              variant="outline"
              fullWidth
              className="h-14 text-lg"
              onClick={() => setEmailModalOpen(true)}
            >
              {t("invite.logIn")}
            </PrimaryButton>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t("invite.free")}
          </p>
        </div>
        <EmailAuthModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          onSuccess={() => {
            setEmailModalOpen(false);
            setTimeout(() => refreshAfterAuthRef.current?.(), 150);
          }}
        />
      </>
    );
  }

  if (isOtherUsed) {
    return (
      <div className="mx-auto max-w-lg py-8 md:py-12">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">{inviterName} {t("invite.hasCreatedForYou")}</h1>
          <p className="text-muted-foreground">{t("invite.inviteAlreadyUsed")}</p>
        </div>
        <div className="mt-8 flex justify-center">
          <PrimaryButton variant="secondary" onClick={() => router.push("/")}>
            {t("common.back")}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (isCreator) {
    return null;
  }

  if (!contract && isInvitee) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (acceptError) {
    return (
      <div className="mx-auto max-w-lg py-8 md:py-12">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p className="text-sm">{acceptError}</p>
          {acceptError.toLowerCase().includes("not authenticated") && (
            <p className="mt-2 text-xs text-muted-foreground pl-0">
              {t("invite.confirmEmailHint")}
            </p>
          )}
        </div>
        <PrimaryButton
          className="mt-4"
          variant="secondary"
          onClick={() => router.push(inviteLink)}
        >
          {t("invite.logIn")}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 py-8 md:py-12">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">
          {inviterName} {t("invite.hasCreatedForYou")}
        </h1>
        <p className="text-muted-foreground">{t("invite.subtitle")}</p>
      </div>

      {contract && (
        <>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b bg-primary/5 p-4">
              <span className="font-semibold text-primary">
                {t("invite.contract")}
              </span>
              <ContractStatusBadge
                status={contract.status}
                className="border bg-background text-xs px-2 py-1"
              />
            </div>
            <div className="space-y-6 p-6">
              <div className="flex gap-4">
                <Home className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("invite.address")}
                  </p>
                  <p className="font-medium">{contract.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("invite.period")}
                  </p>
                  <p className="font-medium">
                    {contract.startDate} – {contract.endDate}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("invite.rent")}
                  </p>
                  <p className="font-medium">
                    {contract.rent.toLocaleString("sv-SE")} kr/mån
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isInvitee && (
            <div className="space-y-4">
              {canSign && (
                <PrimaryButton
                  fullWidth
                  className="h-14 text-lg"
                  onClick={handleSign}
                  disabled={signing}
                >
                  <PenLine className="mr-2 h-5 w-5" />
                  {t("invite.signContract")}
                </PrimaryButton>
              )}
              {bothSigned && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{t("dealRoom.signedActive")}</span>
                </div>
              )}
              {myPartySigned && !bothSigned && (
                <p className="text-center text-sm text-muted-foreground">
                  {t("invite.youHaveSigned")}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {t("invite.free")}
      </p>
    </div>
  );
}
