"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: EmailAuthModalProps) {
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onClose();
        await new Promise((r) => setTimeout(r, 100));
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
        await new Promise((r) => setTimeout(r, 100));
        onSuccess();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("auth.failedDesc")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={t("common.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">
          {mode === "login" ? t("auth.emailLogin") : t("auth.emailCreateAccount")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              {t("auth.emailPlaceholder")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              required
              className={cn(
                "w-full rounded-lg border border-input bg-background px-4 py-3 text-base",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "placeholder:text-muted-foreground"
              )}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              {t("auth.passwordPlaceholder")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              required
              minLength={6}
              className={cn(
                "w-full rounded-lg border border-input bg-background px-4 py-3 text-base",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "placeholder:text-muted-foreground"
              )}
            />
          </div>

          <PrimaryButton
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {mode === "login" ? t("auth.emailLogin") : t("auth.emailCreateAccount")}
          </PrimaryButton>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground underline"
        >
          {mode === "login"
            ? t("auth.switchToSignUp")
            : t("auth.switchToLogin")}
        </button>
      </div>
    </div>
  );
}
