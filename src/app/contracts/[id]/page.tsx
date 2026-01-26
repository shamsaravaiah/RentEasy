"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ContractStatusBadge, ContractStatus } from "@/components/ContractStatusBadge";
import { Loader2, Home, Calendar, CreditCard, User, CheckCircle2, FileText, Send, PenLine, Download } from "lucide-react";
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
    landlord?: { name: string; verified: boolean };
    tenant?: { name: string; verified: boolean };
    hasInvitedParty?: boolean; // Mocked property
}

export default function ContractDetailsPage({ params }: { params: { id: string } }) {
    const { t } = useTranslation();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteSent, setInviteSent] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const data = await api.contracts.get(params.id);
                setContract(data);
            } catch (err) {
                console.error("Failed to load contract", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContract();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!contract) return <div>{t('common.error')}</div>; // Or better "Not found"

    const isDraft = contract.status === "draft";
    const isWaiting = contract.status === "waiting";
    const isSigned = contract.status === "signed";
    const isCompleted = contract.status === "completed";

    const handleInvite = () => {
        setInviteSent(true);
        setTimeout(() => {
            setInviteSent(false);
            setInviteOpen(false);
            // Optimistically update contract to waiting? Or just keep draft but show invited.
        }, 2000);
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
                    <ContractStatusBadge status={contract.status} className="text-sm px-3 py-1" />
                </div>
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
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
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
                            <p className="font-medium">{contract.landlord?.name}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                {contract.role === 'landlord' ? t('common.landlord') : t('common.tenant')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t('dealRoom.verified')}</span>
                    </div>
                </div>

                {/* Other Party */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border-2 border-dashed border-transparent hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {contract.tenant ? (
                            <div>
                                <p className="font-medium">{contract.tenant.name}</p>
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

                    {!contract.tenant && (
                        <button
                            onClick={() => setInviteOpen(!inviteOpen)}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            {inviteOpen ? t('dealRoom.cancelInvite') : t('dealRoom.invite')}
                        </button>
                    )}
                </div>

                {inviteOpen && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg animate-in slide-in-from-top-2 border border-primary/10">
                        <h3 className="font-medium mb-2">{t('dealRoom.inviteTitle')}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('dealRoom.inviteDesc')}
                        </p>

                        {inviteSent ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>{t('dealRoom.inviteSent')}</span>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="motpart@example.com"
                                    className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                                />
                                <PrimaryButton onClick={handleInvite} className="h-10 px-4">
                                    <Send className="h-4 w-4 mr-2" />
                                    {t('dealRoom.send')}
                                </PrimaryButton>
                            </div>
                        )}
                    </div>
                )}
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
                    {isDraft && (
                        <PrimaryButton
                            fullWidth
                            className="h-14 text-lg"
                            disabled={!contract.hasInvitedParty && false} // Enable for demo
                            onClick={() => router.push(`/contracts/${contract.id}/sign`)}
                        >
                            <PenLine className="mr-2 h-5 w-5" />
                            {t('dealRoom.signBtn')}
                        </PrimaryButton>
                    )}

                    {isWaiting && (
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
