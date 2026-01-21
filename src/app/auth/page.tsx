"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { t } = useTranslation();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            await api.auth.startBankID();
            // In a real app we'd redirect to BankID app or show QR code.
            // For this mock, we pretend the user did it and goes to callback
            router.push("/auth/callback?code=mock-code");
        } catch (err) {
            setError(t.auth.failedDesc);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <ShieldCheck className="h-16 w-16 text-primary" />
            </div>

            <h1 className="text-3xl font-bold mb-4">{t.auth.title}</h1>
            <p className="text-muted-foreground mb-8 text-lg">
                {t.auth.description}
            </p>

            {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg mb-6 w-full text-left">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <PrimaryButton
                onClick={handleLogin}
                loading={isLoading}
                fullWidth
                className="h-14 text-lg"
            >
                {t.auth.button}
                <ArrowRight className="ml-2 h-5 w-5" />
            </PrimaryButton>

            <p className="mt-8 text-sm text-muted-foreground">
                {t.auth.termsStart} <a href="/terms" className="underline hover:text-foreground">{t.auth.termsLink}</a>.
            </p>
        </div>
    );
}
