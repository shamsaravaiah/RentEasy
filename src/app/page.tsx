"use client";

import { useState, useEffect } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmailAuthModal } from "@/components/EmailAuthModal";
import { CheckCircle2, Mail } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

async function waitForSessionThenGoToApp(maxMs = 4000): Promise<void> {
  const supabase = createClient();
  const step = 150;
  for (let elapsed = 0; elapsed < maxMs; elapsed += step) {
    const { data, error } = await supabase.auth.getSession();
    if (error) continue;
    const session = data.session;
    if (session && typeof window !== "undefined") {
      window.location.assign("/rentEasy");
      return;
    }
    await new Promise((r) => setTimeout(r, step));
  }
  if (typeof window !== "undefined") window.location.assign("/rentEasy");
}

export default function LandingPage() {
  const { t } = useTranslation();
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // If already logged in (validated), send into the app. Use getUser() so we don't redirect on stale session.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled || error) return;
      const user: User | null = data.user;
      if (!user) return;
      window.location.assign("/rentEasy");
    })();
    return () => { cancelled = true; };
  }, []);

  const handleEmailAuthSuccess = () => {
    waitForSessionThenGoToApp();
  };

  return (
    <div className="flex flex-col gap-12 py-8 md:py-16">
      {/* Hero Section - Sign in / Login */}
      <section className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto min-h-[50vh] justify-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          {t("landing.title")}
        </h1>
        <p className="text-xl md:text-2xl font-medium text-foreground">
          {t("landing.subtitle")}
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
          {t("landing.description")}
        </p>

        <div className="flex flex-col w-full gap-4 mt-8 sm:max-w-md">
          <PrimaryButton
            onClick={() => setEmailModalOpen(true)}
            className="w-full h-14 text-lg"
            fullWidth
          >
            <Mail className="mr-2 h-5 w-5" />
            {t("auth.emailButton")}
          </PrimaryButton>

          <p className="text-sm text-muted-foreground">
            {t("auth.termsStart")}{" "}
            <a href="/terms" className="underline hover:text-foreground">
              {t("auth.termsLink")}
            </a>
            .
          </p>
        </div>

        <EmailAuthModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          onSuccess={handleEmailAuthSuccess}
        />
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/50 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {t("landing.whyTitle")}
        </h2>
        <ul className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <BenefitItem text={t("landing.benefits.binding")} />
          <BenefitItem text={t("landing.benefits.secure")} />
          <BenefitItem text={t("landing.benefits.free")} />
          <BenefitItem text={t("landing.benefits.types")} />
        </ul>
      </section>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
      <span className="text-lg">{text}</span>
    </li>
  );
}
