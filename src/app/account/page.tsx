"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { User, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useTranslation } from "@/context/LanguageContext";

export default function AccountPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                router.push("/");
                return;
            }
            const authUser: AuthUser | null = data.user;
            if (!authUser) {
                router.push("/");
                return;
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", authUser.id)
                .single();
            setUser({
                name: profile?.full_name ?? authUser.email?.split("@")[0] ?? "—",
                email: authUser.email ?? "",
            });
        };
        loadUser();
    }, [router]);

    const handleLogout = async () => {
        setLoading(true);
        await api.auth.logout();
        router.push("/");
    };

    if (!user) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">{t('account.title')}</h1>

            <div className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                            <ShieldCheck className="h-4 w-4" />
                            <span>{t('account.verifiedWith')}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('account.email')}</label>
                        <p>{user.email}</p>
                    </div>
                </div>

                <div className="pt-6 border-t">
                    <PrimaryButton
                        onClick={handleLogout}
                        variant="destructive"
                        loading={loading}
                        fullWidth
                        className="flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-5 w-5" />
                        {t('common.logout')}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
