"use client";

import { useState } from "react";
import { Header } from "./Header";
import { SideDrawer } from "./SideDrawer";
import { LanguageProvider, useTranslation } from "@/context/LanguageContext";

interface ClientLayoutProps {
    children: React.ReactNode;
}

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // We can use translation hook here later if footer needs translation

    return (
        <div className="flex flex-col min-h-screen">
            <Header onMenuClick={() => setIsDrawerOpen(true)} />
            <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
            <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-4 md:p-6">
                {children}
            </main>
            <footer className="mt-auto border-t py-6 md:py-0">
                <FooterContent />
            </footer>
        </div>
    );
}

function FooterContent() {
    const { t } = useTranslation();

    return (
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto px-4 md:px-6">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © 2026 RentEasy. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
                <a href="/terms" className="underline hover:text-foreground">{t('nav.terms')}</a>
                <a href="/privacy" className="underline hover:text-foreground">{t('nav.privacy')}</a>
                <a href="/help" className="underline hover:text-foreground">{t('nav.help')}</a>
            </div>
        </div>
    );
}

export function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <LanguageProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
        </LanguageProvider>
    );
}
