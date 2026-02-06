"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, PenLine } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTranslation } from "@/context/LanguageContext";

export default function SignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t } = useTranslation();
    const [status, setStatus] = useState<
        "checking" | "ready" | "initializing" | "pending" | "complete" | "failed" | "notAllowed"
    >("checking");
    const [error, setError] = useState("");
    const router = useRouter();
    const pollInterval = useRef<NodeJS.Timeout>();
    const orderRef = useRef<string | null>(null);

    useEffect(() => {
        const checkCanSign = async () => {
            try {
                const contract = await api.contracts.get(id);
                const myPartySigned =
                    contract.role === "landlord"
                        ? !!contract.landlord?.signedAt
                        : !!contract.tenant?.signedAt;
                const bothSigned =
                    contract.status === "signed" || contract.status === "completed";
                if (myPartySigned || bothSigned) {
                    setStatus("notAllowed");
                    setError(t("signing.alreadySigned"));
                    return;
                }
                setStatus("ready");
            } catch (err) {
                setStatus("failed");
                setError(err instanceof Error ? err.message : t("signing.startFailed"));
            }
        };
        checkCanSign();
    }, [id, t]);

    const handleSignWithBankId = async () => {
        setStatus("initializing");
        try {
            const response = await api.contracts.sign(id);
            orderRef.current = response.orderRef;
            setStatus("pending");
        } catch (err) {
            setStatus("failed");
            setError(t("signing.startFailed"));
        }
    };

    const handleConfirmSign = async () => {
        setStatus("initializing");
        try {
            await api.contracts.recordSignature(id);
            setStatus("complete");
            setTimeout(() => router.push(`/contracts/${id}`), 2000);
        } catch (err) {
            setStatus("failed");
            setError(err instanceof Error ? err.message : t("signing.startFailed"));
        }
    };

    useEffect(() => {
        if (status === "pending" && !pollInterval.current) {
            pollInterval.current = setInterval(async () => {
                try {
                    if (!orderRef.current) return;
                    const res = await api.contracts.checkSignStatus(orderRef.current);
                    if (res.status === "complete") {
                        if (pollInterval.current) clearInterval(pollInterval.current);
                        try {
                            await api.contracts.recordSignature(id);
                        } catch {
                            // Ignore - signature may already be recorded
                        }
                        setStatus("complete");
                        setTimeout(() => router.push(`/contracts/${id}`), 2000);
                    }
                } catch (err) {
                    // Ignore polling errors
                }
            }, 2000);
        }
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [status, id, router]);

    const handleCancel = () => router.back();

    if (status === "checking") {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                <h1 className="text-xl font-bold">{t("signing.preparing")}</h1>
            </div>
        );
    }

    if (status === "notAllowed") {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="mb-6 inline-block p-4 rounded-full bg-muted">
                    <XCircle className="h-20 w-20 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{t("signing.cannotSign")}</h1>
                <p className="text-muted-foreground mb-8">{error}</p>
                <PrimaryButton variant="secondary" onClick={() => router.push(`/contracts/${id}`)} fullWidth>
                    {t("common.back")}
                </PrimaryButton>
            </div>
        );
    }

    if (status === "ready") {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="mb-8 p-6 bg-primary/5 rounded-full inline-block">
                    <PenLine className="h-20 w-20 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-4">{t("signing.readyTitle")}</h1>
                <p className="text-muted-foreground mb-8">{t("signing.readyDesc")}</p>
                <div className="flex flex-col gap-3 w-full">
                    <PrimaryButton fullWidth className="h-14 text-lg" onClick={handleConfirmSign}>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {t("signing.confirmAndSign")}
                    </PrimaryButton>
                    <PrimaryButton variant="outline" fullWidth className="h-14 text-lg" onClick={handleSignWithBankId}>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        {t("signing.withBankId")}
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" onClick={handleCancel}>
                        {t("common.cancel")}
                    </PrimaryButton>
                </div>
            </div>
        );
    }

    if (status === "initializing") {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                <h1 className="text-xl font-bold">{t("signing.preparing")}</h1>
            </div>
        );
    }

    if (status === "pending") {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full inline-block relative">
                        <ShieldCheck className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">{t("signing.openBankID")}</h1>
                    <p className="text-muted-foreground text-lg mb-8 max-w-xs mx-auto">
                        {t("signing.instruction")}
                    </p>
                    <PrimaryButton variant="secondary" onClick={handleCancel}>
                        {t("common.cancel")}
                    </PrimaryButton>
                </div>
            </div>
        );
    }

    if (status === "complete") {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="animate-in zoom-in duration-300">
                    <div className="mb-6 inline-block p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-20 w-20 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{t("signing.success")}</h1>
                    <p className="text-muted-foreground">{t("signing.successDesc")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
            <div className="animate-in zoom-in duration-300">
                <div className="mb-6 inline-block p-4 rounded-full bg-destructive/10">
                    <XCircle className="h-20 w-20 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{t("signing.failed")}</h1>
                <p className="text-muted-foreground mb-8">{error || t("signing.failed")}</p>
                <div className="flex flex-col gap-3 w-full">
                    <PrimaryButton onClick={() => window.location.reload()} fullWidth>
                        {t("common.tryAgain")}
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" onClick={handleCancel} fullWidth>
                        {t("common.cancel")}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
