"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ArrowRight, Search } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function InviteEnterPage() {
    const { t } = useTranslation();
    const [token, setToken] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (token.trim()) {
            router.push(`/invite/${token.trim()}`);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 flex flex-col gap-8">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">{t('invite.title')}</h1>
                <p className="text-muted-foreground">
                    {t('invite.description')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder={t('invite.placeholder')}
                        className="w-full h-12 pl-10 pr-4 rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    />
                </div>

                <PrimaryButton type="submit" disabled={!token.trim()} fullWidth>
                    {t('invite.button')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                </PrimaryButton>
            </form>
        </div>
    );
}
