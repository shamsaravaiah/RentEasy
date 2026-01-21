"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function SignPage({ params }: { params: { id: string } }) {
    const [status, setStatus] = useState<"initializing" | "pending" | "complete" | "failed">("initializing");
    const [error, setError] = useState("");
    const router = useRouter();
    const pollInterval = useRef<NodeJS.Timeout>();
    const orderRef = useRef<string | null>(null);

    useEffect(() => {
        const startSigning = async () => {
            try {
                const response = await api.contracts.sign(params.id);
                orderRef.current = response.orderRef;
                setStatus("pending");
            } catch (err) {
                setStatus("failed");
                setError("Kunde inte starta signering. Försök igen.");
            }
        };

        startSigning();

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [params.id]);

    useEffect(() => {
        if (status === "pending" && !pollInterval.current) {
            pollInterval.current = setInterval(async () => {
                try {
                    if (!orderRef.current) return;
                    const res = await api.contracts.checkSignStatus(orderRef.current);
                    if (res.status === "complete") {
                        setStatus("complete");
                        if (pollInterval.current) clearInterval(pollInterval.current);
                        setTimeout(() => {
                            router.push(`/contracts/${params.id}`);
                        }, 2000);
                    }
                } catch (err) {
                    // Ignore polling errors usually
                }
            }, 2000);
        }
    }, [status, params.id, router]);

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
            {status === "initializing" && (
                <>
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                    <h1 className="text-xl font-bold">Förbereder signering...</h1>
                </>
            )}

            {status === "pending" && (
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full inline-block relative">
                        <ShieldCheck className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Öppna BankID</h1>
                    <p className="text-muted-foreground text-lg mb-8 max-w-xs mx-auto">
                        Verifiera dig i BankID-appen för att signera kontraktet.
                    </p>
                    <PrimaryButton variant="secondary" onClick={handleCancel}>
                        Avbryt
                    </PrimaryButton>
                </div>
            )}

            {status === "complete" && (
                <div className="animate-in zoom-in duration-300">
                    <div className="mb-6 inline-block p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-20 w-20 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Signering klar!</h1>
                    <p className="text-muted-foreground">Du skickas tillbaka till kontraktet...</p>
                </div>
            )}

            {status === "failed" && (
                <div className="animate-in zoom-in duration-300">
                    <div className="mb-6 inline-block p-4 rounded-full bg-destructive/10">
                        <XCircle className="h-20 w-20 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Något gick fel</h1>
                    <p className="text-muted-foreground mb-8">{error || "Signeringen misslyckades."}</p>
                    <div className="flex flex-col gap-3 w-full">
                        <PrimaryButton onClick={() => window.location.reload()} fullWidth>Försök igen</PrimaryButton>
                        <PrimaryButton variant="secondary" onClick={handleCancel} fullWidth>Avbryt</PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    );
}
