"use client";

import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
    className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useTranslation();

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex border rounded-lg overflow-hidden h-8">
                <button
                    onClick={() => setLanguage("sv")}
                    className={cn(
                        "px-2 text-xs font-medium transition-colors hover:bg-muted",
                        language === "sv"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background text-foreground"
                    )}
                >
                    SV
                </button>
                <button
                    onClick={() => setLanguage("en")}
                    className={cn(
                        "px-2 text-xs font-medium transition-colors hover:bg-muted",
                        language === "en"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-background text-foreground"
                    )}
                >
                    EN
                </button>
            </div>
        </div>
    );
}
