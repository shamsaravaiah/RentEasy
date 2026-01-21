"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTranslation } from "@/context/LanguageContext";


function AuthCallbackContent() {
    // Use status 'verifying', 'success', 'error'
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectRan = useRef(false);
    const { t } = useTranslation();

    useEffect(() => {
        // React strict mode runs effects twice, prevent double call
        if (effectRan.current) return;
        effectRan.current = true;

        const verify = async () => {
            const code = searchParams.get("code");

            if (!code) {
                setStatus("error");
                return;
            }

            try {
                await api.auth.verifyCallback(code);
                setStatus("success");
                // Redirect after success
                setTimeout(() => {
                    router.push("/contracts");
                }, 1500);
            } catch (err) {
                setStatus("error");
            }
        };

        verify();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
            {status === "verifying" && (
                <>
                    <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                    <h1 className="text-2xl font-bold mb-2">{t.auth.verifying}</h1>
                    <p className="text-muted-foreground">{t.auth.wait}</p>
                </>
            )}

            {status === "success" && (
                <>
                    <CheckCircle2 className="h-16 w-16 text-green-600 mb-6 animate-in zoom-in duration-300" />
                    <h1 className="text-2xl font-bold mb-2">{t.auth.success}</h1>
                    <p className="text-muted-foreground">{t.auth.redirecting}</p>
                </>
            )}

            {status === "error" && (
                <>
                    <AlertCircle className="h-16 w-16 text-destructive mb-6" />
                    <h1 className="text-2xl font-bold mb-2">{t.auth.failed}</h1>
                    <p className="text-muted-foreground mb-8">{t.auth.failedDesc}</p>
                    <PrimaryButton onClick={() => router.push("/auth")} fullWidth>
                        {t.common.tryAgain}
                    </PrimaryButton>
                </>
            )}
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
