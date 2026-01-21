"use client";

import { useState } from "react";
import { Header } from "./Header";
import { SideDrawer } from "./SideDrawer";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <Header onMenuClick={() => setIsDrawerOpen(true)} />
            <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
            <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-4 md:p-6">
                {children}
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto px-4 md:px-6">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © 2026 RentEasy. Alla rättigheter förbehållna.
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <a href="/terms" className="underline hover:text-foreground">Villkor</a>
                        <a href="/privacy" className="underline hover:text-foreground">Integritet</a>
                        <a href="/help" className="underline hover:text-foreground">Hjälp</a>
                    </div>
                </div>
            </footer>
        </>
    );
}
