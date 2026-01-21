"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Loader2, Home, Calendar, CreditCard, ArrowRight, AlertTriangle } from "lucide-react";

export default function InviteLandingPage({ params }: { params: { token: string } }) {
    const [invite, setInvite] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const data = await api.invites.get(params.token);
                setInvite(data);
            } catch (err) {
                setError("Kunde inte hitta inbjudan. Länken kan vara ogiltig eller utgången.");
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [params.token]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div className="max-w-md mx-auto py-12 text-center px-4">
                <div className="mb-6 mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Ogiltig länk</h1>
                <p className="text-muted-foreground mb-8">{error}</p>
                <PrimaryButton onClick={() => router.push("/")} variant="secondary">
                    Till startsidan
                </PrimaryButton>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto py-8 md:py-12 flex flex-col gap-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">{invite.inviterName} har bjudit in dig</h1>
                <p className="text-muted-foreground">
                    Du har blivit inbjuden att signera ett hyreskontrakt via RentEasy.
                </p>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
                    <span className="font-semibold text-primary">Hyresavtal</span>
                    <span className="bg-background text-xs border px-2 py-1 rounded-full">Utkast</span>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <Home className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Adress</p>
                            <p className="font-medium">{invite.address}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Hyresperiod</p>
                            <p className="font-medium">{invite.startDate} - {invite.endDate}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Månadshyra</p>
                            <p className="font-medium">{invite.rent.toLocaleString("sv-SE")} kr</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <PrimaryButton
                    onClick={() => router.push("/auth")}
                    fullWidth
                    className="h-14 text-lg"
                >
                    Fortsätt med BankID
                    <ArrowRight className="ml-2 h-5 w-5" />
                </PrimaryButton>
                <p className="text-center text-xs text-muted-foreground">
                    Det är helt gratis att skapa konto och signera.
                </p>
            </div>
        </div>
    );
}
