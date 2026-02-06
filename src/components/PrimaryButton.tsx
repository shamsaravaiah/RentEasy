import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "destructive" | "outline";
    loading?: boolean;
    fullWidth?: boolean;
}

export function PrimaryButton({
    children,
    className,
    variant = "primary",
    loading = false,
    fullWidth = false,
    disabled,
    ...props
}: PrimaryButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[48px]";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                fullWidth ? "w-full" : "w-full sm:w-auto sm:min-w-[200px]",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            <span className={cn("inline-flex shrink-0 mr-2 w-5 h-5 items-center justify-center", !loading && "!m-0 !w-0 !min-w-0 overflow-hidden opacity-0")}>
                <Loader2 className="h-5 w-5 animate-spin" />
            </span>
            {children}
        </button>
    );
}
