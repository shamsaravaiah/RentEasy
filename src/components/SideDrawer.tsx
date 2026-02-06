"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, LogOut, FileText, User, HelpCircle, Shield, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { api } from "@/lib/api";

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useTranslation();
    const [signingOut, setSigningOut] = useState(false);

    // Close drawer when route changes (only depend on pathname so we don't close on every parent re-render)
    const prevPathname = useRef(pathname);
    useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;
            onClose();
        }
    }, [pathname, onClose]);

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const navItems = [
        { href: "/rentEasy", label: t('nav.contracts'), icon: FileText },
        { href: "/account", label: t('nav.account'), icon: User },
        { href: "/help", label: t('nav.help'), icon: HelpCircle },
        { href: "/terms", label: t('nav.terms'), icon: Shield },
        { href: "/privacy", label: t('nav.privacy'), icon: FileCheck },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer - left side */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] bg-background shadow-xl transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">{t('common.menu')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors",
                                        pathname === item.href
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t mt-auto">
                    <button
                        onClick={async () => {
                            if (signingOut) return;
                            setSigningOut(true);
                            onClose();
                            try {
                                await api.auth.logout();
                                router.push("/");
                                router.refresh();
                            } catch {
                                router.push("/");
                                router.refresh();
                            } finally {
                                setSigningOut(false);
                            }
                        }}
                        disabled={signingOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {signingOut ? t('common.loading') : t('common.logout')}
                    </button>
                </div>
            </div>
        </>
    );
}
