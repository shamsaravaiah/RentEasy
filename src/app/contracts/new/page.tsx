"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { api } from "@/lib/api";
import { Building2, UserCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewContractPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: "", // "landlord" | "tenant"
        address: "",
        startDate: "",
        endDate: "",
        rent: "",
        deposit: "",
    });

    const handleCreate = async () => {
        setLoading(true);
        try {
            const contract = await api.contracts.create(formData);
            router.push(`/contracts/${contract.id}`);
        } catch (err) {
            console.error("Failed to create contract", err);
            // In a real app handle error state
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = !!formData.role;
    const isStep2Valid =
        formData.address &&
        formData.startDate &&
        formData.endDate &&
        Number(formData.rent) > 0;

    return (
        <div className="max-w-xl mx-auto py-6 md:py-12">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className={cn(step === 1 && "text-primary font-medium")}>Steg 1: Din roll</span>
                    <span>/</span>
                    <span className={cn(step === 2 && "text-primary font-medium")}>Steg 2: Uppgifter</span>
                </div>
                <h1 className="text-3xl font-bold">
                    {step === 1 ? "Vem är du i detta avtal?" : "Fyll i detaljer"}
                </h1>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <button
                        onClick={() => setFormData({ ...formData, role: "landlord" })}
                        className={cn(
                            "w-full p-6 text-left border-2 rounded-xl transition-all hover:border-primary/50 flex items-center gap-4",
                            formData.role === "landlord"
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card"
                        )}
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Jag är hyresvärd</h3>
                            <p className="text-muted-foreground">Jag äger bostaden eller har förstahandskontrakt</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setFormData({ ...formData, role: "tenant" })}
                        className={cn(
                            "w-full p-6 text-left border-2 rounded-xl transition-all hover:border-primary/50 flex items-center gap-4",
                            formData.role === "tenant"
                                ? "border-primary bg-primary/5"
                                : "border-border bg-card"
                        )}
                    >
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                            <UserCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Jag är hyresgäst</h3>
                            <p className="text-muted-foreground">Jag ska hyra bostaden</p>
                        </div>
                    </button>

                    <div className="pt-8">
                        <PrimaryButton
                            disabled={!isStep1Valid}
                            onClick={() => setStep(2)}
                            fullWidth
                            className="h-14 text-lg"
                        >
                            Nästa steg
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Adress till bostaden</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="T.ex. Storgatan 12, 123 45 Stockholm"
                            className="w-full h-12 px-4 rounded-lg border bg-background"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Inflyttning</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full h-12 px-4 rounded-lg border bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Utflyttning</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full h-12 px-4 rounded-lg border bg-background"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Månadshyra (SEK)</label>
                        <input
                            type="number"
                            value={formData.rent}
                            onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                            placeholder="0"
                            className="w-full h-12 px-4 rounded-lg border bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Deposition (SEK)</label>
                        <input
                            type="number"
                            value={formData.deposit}
                            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                            placeholder="0"
                            className="w-full h-12 px-4 rounded-lg border bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Frivilligt, lämna tomt för ingen deposition.</p>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <PrimaryButton
                            variant="secondary"
                            onClick={() => setStep(1)}
                            className="h-14 px-6"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Tillbaka
                        </PrimaryButton>
                        <PrimaryButton
                            disabled={!isStep2Valid}
                            onClick={handleCreate}
                            loading={loading}
                            fullWidth
                            className="h-14 text-lg"
                        >
                            Skapa kontrakt
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    );
}
