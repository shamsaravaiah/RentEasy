import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/LanguageContext";

export type ContractStatus = "draft" | "waiting" | "signed" | "completed";

interface ContractStatusBadgeProps {
    status: ContractStatus;
    className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
    const { t } = useTranslation();

    const styles = {
        draft: "bg-muted text-muted-foreground",
        waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
        signed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
        completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    };

    const statusKey = status as keyof typeof styles;

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                styles[statusKey],
                className
            )}
        >
            {t(`contracts.status.${statusKey}`)}
        </span>
    );
}
