"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ContractCard } from "@/components/ContractCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Plus, FolderOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { ContractStatus } from "@/components/ContractStatusBadge";

interface ContractSummary {
    id: string;
    address: string;
    status: ContractStatus;
    rent: number;
    startDate: string;
    endDate: string;
}

export default function ContractsPage() {
    const [contracts, setContracts] = useState<ContractSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const data = await api.contracts.list();
                setContracts(data);
            } catch (err) {
                console.error("Failed to load contracts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="py-6 md:py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">Mina kontrakt</h1>
                <Link href="/contracts/new">
                    <PrimaryButton className="hidden md:flex">
                        Nytt kontrakt
                        <Plus className="ml-2 h-5 w-5" />
                    </PrimaryButton>
                </Link>
            </div>

            {contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                    <div className="bg-background p-4 rounded-full mb-4">
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Inga kontrakt än</h2>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Det ser ut som att du inte har några kontrakt ännu. Skapa ditt första kontrakt idag.
                    </p>
                    <Link href="/contracts/new">
                        <PrimaryButton>
                            Skapa nytt kontrakt
                            <Plus className="ml-2 h-5 w-5" />
                        </PrimaryButton>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {contracts.map((contract) => (
                        <ContractCard
                            key={contract.id}
                            id={contract.id}
                            address={contract.address}
                            status={contract.status}
                            rent={contract.rent}
                            startDate={contract.startDate}
                            endDate={contract.endDate}
                        />
                    ))}
                </div>
            )}

            {/* Mobile Floating Action Button */}
            <Link href="/contracts/new" className="md:hidden fixed bottom-6 right-6 shadow-lg z-20">
                <PrimaryButton className="rounded-full w-14 h-14 p-0 flex items-center justify-center">
                    <Plus className="h-8 w-8" />
                </PrimaryButton>
            </Link>
        </div>
    );
}
