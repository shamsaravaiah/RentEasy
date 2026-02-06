"use client";

import React, { createContext, useContext } from "react";
import { en } from "@/locales/en";

type Language = "sv" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Single locale for now to avoid hydration mismatch (no localStorage, no document.lang)
const FIXED_LANGUAGE: Language = "en";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: Record<string, unknown> | string = en as Record<string, unknown>;

        for (const k of keys) {
            if (value === undefined) return key;
            value = (value as Record<string, unknown>)[k] as Record<string, unknown> | string;
        }

        return typeof value === "string" ? value : key;
    };

    return (
        <LanguageContext.Provider
            value={{
                language: FIXED_LANGUAGE,
                setLanguage: () => {},
                t,
            }}
        >
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
