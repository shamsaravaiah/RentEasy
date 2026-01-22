"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { sv, Dictionary } from "@/locales/sv";
import { en } from "@/locales/en";

type Language = "sv" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("sv");

    useEffect(() => {
        // Load persisted language preference
        const saved = localStorage.getItem("language") as Language;
        if (saved && (saved === "sv" || saved === "en")) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        // Update html lang attribute for accessibility
        document.documentElement.lang = lang;
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = language === 'sv' ? sv : en;

        for (const k of keys) {
            if (value === undefined) return key;
            value = value[k];
        }

        return (typeof value === 'string') ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
