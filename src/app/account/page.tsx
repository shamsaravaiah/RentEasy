"use client";

import { PrimaryButton } from "@/components/PrimaryButton";
import { User, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";

export default function AccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Mock user data since we don't have a real persistent auth store in this mock
    const user = {
        name: "Anna Andersson",
        personalNumber: "19800101-XXXX",
        verifiedAt: "2026-01-21",
        email: "anna.andersson@example.com"
    };

    const handleLogout = async () => {
        setLoading(true);
        await api.auth.logout();
        router.push("/");
    };

    return (
        <div className="max-w-md mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Mitt konto</h1>

            <div className="bg-card border rounded-lg p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Verifierad med BankID</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Personnummer</label>
                        <p className="font-mono text-lg">{user.personalNumber}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Verifierad sedan</label>
                        <p>{user.verifiedAt}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">E-post</label>
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
                        Logga ut
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
