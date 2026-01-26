"use client";

import Link from "next/link";
import { X, LogOut, FileText, User, HelpCircle, Shield, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const pathname = usePathname();
    const { t } = useTranslation();

    // Close drawer when route changes
    useEffect(() => {
        onClose();
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
        { href: "/contracts", label: t('nav.contracts'), icon: FileText },
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

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-[280px] sm:w-[320px] bg-background shadow-xl transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">{t('common.menu')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 border-b flex justify-center">
                    <LanguageSwitcher />
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
                        // TODO: Implement actual logout logic
                        onClick={() => console.log("Logout clicked")}
                        className="flex w-full items-center gap-3 px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        {t('common.logout')}
                    </button>
                </div>
            </div>
        </>
    );
}
