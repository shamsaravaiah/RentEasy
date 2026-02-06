"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ContractStatusBadge, ContractStatus } from "@/components/ContractStatusBadge";
import { Loader2, Home, Calendar, CreditCard, User, CheckCircle2, FileText, PenLine, Download, Copy, Trash2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/LanguageContext";

interface Contract {
    id: string;
    address: string;
    startDate: string;
    endDate: string;
    rent: number;
    deposit?: number;
    status: ContractStatus;
    role: "landlord" | "tenant";
    isCreator?: boolean;
    landlord?: { name: string; verified: boolean; signedAt?: string };
    tenant?: { name: string; verified: boolean; signedAt?: string };
    hasInvitedParty?: boolean;
    inviteLink?: string | null;
}

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t } = useTranslation();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchContract = async () => {
            const supabase = createClient();
            let { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                await new Promise((r) => setTimeout(r, 600));
                const retry = await supabase.auth.getUser();
                user = retry.data.user;
            }
            if (!user) {
                router.replace("/");
                return;
            }
            setLoadError(null);
            try {
                const data = await api.contracts.get(id);
                setContract(data);
                setInviteLink(data.inviteLink ?? null);
            } catch (err) {
                console.error("Failed to load contract", err);
                setLoadError(err instanceof Error ? err.message : t("common.error"));
            } finally {
                setLoading(false);
            }
        };

        fetchContract();
    }, [id, router, t]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="max-w-md mx-auto py-12 text-center px-4">
                <h1 className="text-2xl font-bold mb-4">{t("common.somethingWentWrong")}</h1>
                <p className="text-muted-foreground mb-8">{loadError ?? t("common.error")}</p>
                <PrimaryButton onClick={() => router.push("/rentEasy")} variant="secondary">
                    {t("common.back")}
                </PrimaryButton>
            </div>
        );
    }

    const otherParty = contract.role === "landlord" ? contract.tenant : contract.landlord;
    const hasOtherParty = !!otherParty;

    const isDraft = contract.status === "draft";
    const isWaiting = contract.status === "waiting";
    const isSigned = contract.status === "signed";
    const isCompleted = contract.status === "completed";

    const handleCopyLink = () => {
        if (inviteLink) navigator.clipboard.writeText(inviteLink);
    };

    const isCreator = contract.isCreator ?? false;
    const canDelete = (isDraft || isWaiting) && isCreator;
    const myPartySigned = contract.role === "landlord"
        ? !!contract.landlord?.signedAt
        : !!contract.tenant?.signedAt;
    const canSign = (isDraft || isWaiting) && !myPartySigned;
    const handleDelete = async () => {
        if (!contract || !canDelete) return;
        if (!window.confirm(t("dealRoom.deleteConfirm"))) return;
        setDeleteError(null);
        setDeleting(true);
        try {
            await api.contracts.delete(contract.id);
            router.replace("/rentEasy");
            router.refresh();
        } catch (err) {
            const msg = err instanceof Error ? err.message : t("common.error");
            setDeleteError(
                msg.includes("Only draft") || msg.includes("Could not delete")
                    ? t("dealRoom.deleteOnlyDraftOrWaiting")
                    : msg
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="py-6 md:py-8 space-y-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b pb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">{t('dealRoom.title')}</h1>
                        <p className="text-sm text-muted-foreground">ID: {contract.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/90 hover:underline disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                {deleting ? t("common.loading") : t("dealRoom.deleteContract")}
                            </button>
                        )}
                        <ContractStatusBadge status={contract.status} className="text-sm px-3 py-1" />
                    </div>
                </div>
                {deleteError && (
                    <p className="text-sm text-destructive">{deleteError}</p>
                )}
            </div>

            {/* Property Info */}
            <section className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Home className="h-5 w-5 text-muted-foreground" />
                        {t('dealRoom.object')}
                    </h2>
                    {isDraft && (
                        <button className="text-sm text-primary hover:underline font-medium">
                            {t('dealRoom.change')}
                        </button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('createContract.address')}</p>
                        <p className="font-medium text-lg">{contract.address}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {t('dealRoom.period')}
                        </p>
                        <p className="font-medium">{contract.startDate} - {contract.endDate}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <CreditCard className="h-4 w-4" /> {t('dealRoom.rent')}
                        </p>
                        <p className="font-medium">{contract.rent.toLocaleString("sv-SE")} kr/mån</p>
                    </div>
                    {contract.deposit && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{t('dealRoom.deposit')}</p>
                            <p className="font-medium">{Number(contract.deposit).toLocaleString("sv-SE")} kr</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Parties */}
            <section className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    {t('dealRoom.parties')}
                </h2>

                {/* You */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{t('dealRoom.me')}</span>
                        </div>
                        <div>
                            <p className="font-medium">
                                {(contract.role === 'landlord' ? contract.landlord : contract.tenant)?.name ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                {contract.role === 'landlord' ? t('common.landlord') : t('common.tenant')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {myPartySigned && (
                            <span className="text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {t('dealRoom.signed')}
                            </span>
                        )}
                        <span className="text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t('dealRoom.verified')}
                        </span>
                    </div>
                </div>

                {/* Other Party */}
                <div className="p-4 bg-secondary/30 rounded-lg border-2 border-dashed border-transparent hover:border-border transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            {hasOtherParty ? (
                                <div>
                                    <p className="font-medium">{otherParty?.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                        {contract.role === 'landlord' ? t('common.tenant') : t('common.landlord')}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-medium text-muted-foreground">{t('dealRoom.missingParty')}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                        {contract.role === 'landlord' ? t('common.tenant') : t('common.landlord')}
                                    </p>
                                </div>
                            )}
                        </div>
                        {(otherParty?.signedAt || (contract.role === 'landlord' ? contract.tenant?.signedAt : contract.landlord?.signedAt)) && (
                            <span className="text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="h-3 w-3" />
                                {t('dealRoom.signed')}
                            </span>
                        )}

                        {isCreator && (isDraft || isWaiting) && !inviteLink && (
                            <PrimaryButton
                                variant="outline"
                                onClick={async () => {
                                    if (contract) {
                                        setInviteLoading(true);
                                        try {
                                            const otherRole = contract.role === "landlord" ? "tenant" : "landlord";
                                            const { inviteLink: link } = await api.invites.create(contract.id, otherRole);
                                            setInviteLink(link);
                                            setContract({ ...contract, hasInvitedParty: true, inviteLink: link });
                                        } catch (err) {
                                            console.error("Failed to create invite", err);
                                        } finally {
                                            setInviteLoading(false);
                                        }
                                    }
                                }}
                                disabled={inviteLoading}
                                className="shrink-0 min-h-10 h-10 px-4 text-sm"
                            >
                                <Link2 className="h-4 w-4 mr-1.5" />
                                {inviteLoading ? t("common.loading") : t("dealRoom.createLink")}
                            </PrimaryButton>
                        )}
                    </div>

                    {isCreator && (isDraft || isWaiting) && inviteLink && (
                        <div className="flex gap-2 pt-3 border-t border-border/50 mt-3">
                            <input
                                type="text"
                                readOnly
                                value={inviteLink}
                                className="flex-1 min-w-0 h-9 px-3 rounded-md border bg-background text-sm"
                            />
                            <PrimaryButton onClick={handleCopyLink} variant="outline" className="h-9 px-3 shrink-0 text-sm">
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                {t('common.copy')}
                            </PrimaryButton>
                        </div>
                    )}
                </div>
            </section>

            {/* Contract Preview */}
            <section className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{t('dealRoom.previewTitle')}</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        {t('dealRoom.previewDesc')}
                    </p>
                </div>
                <PrimaryButton variant="secondary" fullWidth className="max-w-xs">
                    {t('dealRoom.previewBtn')}
                </PrimaryButton>
            </section>

            {/* Actions */}
            <section className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background/95 backdrop-blur md:relative md:bg-transparent md:border-0 md:p-0 md:pb-8">
                <div className="max-w-2xl mx-auto flex flex-col gap-3">
                    {isDraft && canSign && (
                        <PrimaryButton
                            fullWidth
                            className="h-14 text-lg"
                            disabled={!hasOtherParty}
                            onClick={() => router.push(`/contracts/${contract.id}/sign`)}
                        >
                            <PenLine className="mr-2 h-5 w-5" />
                            {t('dealRoom.signBtn')}
                        </PrimaryButton>
                    )}

                    {isWaiting && canSign && (
                        <PrimaryButton
                            fullWidth
                            className="h-14 text-lg"
                            onClick={() => router.push(`/contracts/${contract.id}/sign`)}
                        >
                            <PenLine className="mr-2 h-5 w-5" />
                            {t('dealRoom.signBtn')}
                        </PrimaryButton>
                    )}

                    {isSigned && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 justify-center text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">{t('dealRoom.signedActive')}</span>
                            </div>
                            <PrimaryButton fullWidth variant="secondary" className="h-14">
                                <Download className="mr-2 h-5 w-5" />
                                {t('dealRoom.downloadBtn')}
                            </PrimaryButton>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="text-center p-4 bg-muted rounded-lg border">
                            <p className="font-medium">{t('dealRoom.completed')}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Spacer for fixed mobile footer */}
            <div className="h-24 md:hidden" />
        </div>
    );
}
