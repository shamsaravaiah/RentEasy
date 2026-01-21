"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
    onMenuClick: () => void;
    showBack?: boolean;
    title?: string;
    className?: string;
}

export function Header({ onMenuClick, showBack, title, className }: HeaderProps) {
    const router = useRouter();

    return (
        <header
            className={cn(
                "sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14",
                className
            )}
        >
            <div className="flex h-14 items-center px-4 md:px-6">
                <div className="flex-1 flex items-center justify-start">
                    {showBack ? (
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                            aria-label="Gå tillbaka"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    ) : (
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                            RentEasy
                        </Link>
                    )}
                </div>

                {title && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 font-semibold text-lg truncate max-w-[50%] text-center">
                        {title}
                    </div>
                )}

                <div className="flex-1 flex items-center justify-end gap-2">
                    <LanguageSwitcher className="mr-2" />
                    <button
                        onClick={onMenuClick}
                        className="p-2 -mr-2 text-foreground hover:bg-accent rounded-full transition-colors"
                        aria-label="Öppna meny"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}
