"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/LanguageContext";

interface HeaderProps {
    onMenuClick: () => void;
    showBack?: boolean;
    title?: string;
    className?: string;
}

export function Header({ onMenuClick, title, className }: HeaderProps) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isLanding = pathname === "/";
    const homeHref = isLanding ? "/" : "/rentEasy";

    return (
        <header
            className={cn(
                "sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14",
                className
            )}
        >
            <div className="relative flex h-14 items-center px-4 md:px-6">
                <div className="flex-1 flex items-center justify-start min-w-0 z-10">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMenuClick();
                        }}
                        className="p-2 -ml-2 text-foreground hover:bg-accent rounded-full transition-colors touch-manipulation"
                        aria-label={t('common.menu')}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {title && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-semibold text-lg truncate max-w-[50%] text-center">
                            {title}
                        </span>
                    </div>
                )}

                <div className="flex-1 flex items-center justify-end min-w-0 z-10">
                    <Link href={homeHref} className="flex items-center gap-2 font-bold text-xl text-primary">
                        RentEasy
                    </Link>
                </div>
            </div>
        </header>
    );
}
