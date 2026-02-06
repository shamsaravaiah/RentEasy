"use client";

import { useEffect, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ContractCard } from "@/components/ContractCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Plus, FolderOpen, Loader2, Inbox, FileEdit } from "lucide-react";
import Link from "next/link";
import { ContractStatus } from "@/components/ContractStatusBadge";
import { useTranslation } from "@/context/LanguageContext";

interface ContractSummary {
  id: string;
  address: string;
  status: ContractStatus;
  rent: number;
  startDate: string;
  endDate: string;
  isCreator?: boolean;
}

export function ContractsDashboard() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchContracts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        router.replace("/");
        return;
      }
      let user: User | null = data.user;
      if (!user) {
        await new Promise((r) => setTimeout(r, 600));
        const retry = await supabase.auth.getUser();
        if (retry.error) {
          router.replace("/");
          return;
        }
        user = retry.data.user;
      }
      if (!user) {
        router.replace("/");
        return;
      }
      try {
        const data = await api.contracts.list();
        setContracts(data);
      } catch (err) {
        console.error("Failed to load contracts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myContracts = contracts.filter((c) => c.isCreator);
  const receivedContracts = contracts.filter((c) => !c.isCreator);
  const hasAny = contracts.length > 0;

  const ContractSection = ({
    title,
    items,
    emptyKey,
    emptyDescKey,
    icon: Icon,
  }: {
    title: string;
    items: ContractSummary[];
    emptyKey: string;
    emptyDescKey: string;
    icon: ElementType;
  }) => (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        {title}
      </h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border-2 border-dashed">
          <div className="bg-background p-3 rounded-full mb-3">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t(emptyKey)}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">{t(emptyDescKey)}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((contract) => (
            <ContractCard
              key={contract.id}
              id={contract.id}
              address={contract.address}
              status={contract.status}
              rent={contract.rent}
              startDate={contract.startDate}
              endDate={contract.endDate}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="py-6 md:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          {t("contracts.dashboardTitle")}
        </h1>
        <Link href="/contracts/new" className="hidden md:inline-flex shrink-0">
          <PrimaryButton>
            {t("landing.createContract")}
            <Plus className="ml-2 h-5 w-5" />
          </PrimaryButton>
        </Link>
      </div>

      {!hasAny ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed">
          <div className="bg-background p-4 rounded-full mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("contracts.noContracts")}</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t("contracts.noContractsDesc")}
          </p>
          <Link href="/contracts/new">
            <PrimaryButton>
              {t("contracts.createFirst")}
              <Plus className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <>
          <ContractSection
            title={t("contracts.myContracts")}
            items={myContracts}
            emptyKey="contracts.noMyContracts"
            emptyDescKey="contracts.noMyContractsDesc"
            icon={FileEdit}
          />
          <ContractSection
            title={t("contracts.receivedContracts")}
            items={receivedContracts}
            emptyKey="contracts.noReceivedContracts"
            emptyDescKey="contracts.noReceivedContractsDesc"
            icon={Inbox}
          />
        </>
      )}

      {/* Mobile Floating Action Button */}
      <Link
        href="/contracts/new"
        className="md:hidden fixed bottom-6 right-6 shadow-lg z-20"
      >
        <PrimaryButton className="rounded-full w-14 h-14 p-0 flex items-center justify-center">
          <Plus className="h-8 w-8" />
        </PrimaryButton>
      </Link>
    </div>
  );
}
