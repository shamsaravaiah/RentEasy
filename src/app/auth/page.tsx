"use client";

import { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmailAuthModal } from "@/components/EmailAuthModal";
import { ShieldCheck, ArrowRight, AlertCircle, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";

const AUTH_REDIRECT_KEY = "authRedirect";

function getRedirectTarget(): string {
    if (typeof window === "undefined") return "/rentEasy";
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("redirect");
    if (fromUrl && fromUrl.startsWith("/")) return fromUrl;
    const fromStorage = sessionStorage.getItem(AUTH_REDIRECT_KEY);
    if (fromStorage && fromStorage.startsWith("/")) return fromStorage;
    return "/rentEasy";
}

/** Wait for Supabase session to be available (e.g. after login), then run callback. */
async function waitForSessionThenRedirect(target: string, maxMs = 4000): Promise<void> {
    const supabase = createClient();
    const step = 150;
    for (let elapsed = 0; elapsed < maxMs; elapsed += step) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            if (typeof window !== "undefined") window.location.assign(target);
            return;
        }
        await new Promise((r) => setTimeout(r, step));
    }
    if (typeof window !== "undefined") window.location.assign(target);
}

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");
    const { t } = useTranslation();

    // When coming from invite link, open email auth modal so they can sign in without an extra click
    useEffect(() => {
        if (!redirect || !redirect.startsWith("/")) return;
        const open = setTimeout(() => setEmailModalOpen(true), 100);
        return () => clearTimeout(open);
    }, [redirect]);

    // If already logged in (validated with server), send user into the app. Use getUser() not getSession() so we don't redirect on stale/cached session.
    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (cancelled || !user) return;
            const target = getRedirectTarget();
            if (typeof window !== "undefined") sessionStorage.removeItem(AUTH_REDIRECT_KEY);
            window.location.assign(target);
        });
        return () => { cancelled = true; };
    }, [redirect, searchParams]);

    // Persist redirect so it survives magic-link / Supabase redirects that drop the query
    useEffect(() => {
        const r = redirect ?? searchParams.get("redirect");
        if (r && r.startsWith("/") && typeof window !== "undefined") {
            sessionStorage.setItem(AUTH_REDIRECT_KEY, r);
        }
    }, [redirect, searchParams]);

    const handleEmailAuthSuccess = () => {
        const target = getRedirectTarget();
        if (typeof window !== "undefined") sessionStorage.removeItem(AUTH_REDIRECT_KEY);
        waitForSessionThenRedirect(target);
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            await api.auth.startBankID();
            const redirectParam = redirect && redirect.startsWith("/") ? `&redirect=${encodeURIComponent(redirect)}` : "";
            router.push(`/auth/callback?code=mock-code${redirectParam}`);
        } catch (err) {
            setError(t('auth.failedDesc'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <ShieldCheck className="h-16 w-16 text-primary" />
            </div>

            <h1 className="text-3xl font-bold mb-4">{t('auth.title')}</h1>
            <p className="text-muted-foreground mb-8 text-lg">
                {t('auth.description')}
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
                {t('auth.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
            </PrimaryButton>

            <div className="relative my-6 w-full">
                <span className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </span>
                <span className="relative flex justify-center text-sm text-muted-foreground">
                    {t('common.or')}
                </span>
            </div>

            <PrimaryButton
                variant="outline"
                onClick={() => setEmailModalOpen(true)}
                fullWidth
                className="h-14 text-lg"
            >
                <Mail className="mr-2 h-5 w-5" />
                {t('auth.emailButton')}
            </PrimaryButton>

            <EmailAuthModal
                isOpen={emailModalOpen}
                onClose={() => setEmailModalOpen(false)}
                onSuccess={handleEmailAuthSuccess}
            />

            <p className="mt-8 text-sm text-muted-foreground">
                {t('auth.termsStart')} <a href="/terms" className="underline hover:text-foreground">{t('auth.termsLink')}</a>.
            </p>
        </div>
    );
}
