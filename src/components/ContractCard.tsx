import Link from "next/link";
import { ContractStatusBadge, ContractStatus } from "./ContractStatusBadge";
import { cn } from "@/lib/utils";

interface ContractCardProps {
    id: string;
    address: string;
    status: ContractStatus;
    rent: number;
    startDate: string;
    endDate: string;
    className?: string;
}

export function ContractCard({
    id,
    address,
    status,
    rent,
    startDate,
    endDate,
    className,
}: ContractCardProps) {
    return (
        <Link
            href={`/contracts/${id}`}
            className={cn(
                "block rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50",
                className
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg truncate flex-1 pr-2">{address}</h3>
                <ContractStatusBadge status={status} />
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                    {startDate} - {endDate}
                </p>
                <p className="font-medium text-foreground">
                    {rent.toLocaleString("sv-SE")} kr/mån
                </p>
            </div>
        </Link>
    );
}
