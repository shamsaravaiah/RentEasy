"use client";

import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CheckCircle2, ArrowRight, UserPlus } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-12 py-8 md:py-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          {t.landing.title}
        </h1>
        <p className="text-xl md:text-2xl font-medium text-foreground">
          {t.landing.subtitle}
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
          {t.landing.description}
        </p>

        <div className="flex flex-col w-full gap-4 mt-4 sm:max-w-md">
          <Link href="/contracts/new" className="w-full">
            <PrimaryButton className="w-full h-14 text-lg" fullWidth>
              {t.landing.createContract}
              <ArrowRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </Link>

          <Link href="/invite/enter" className="w-full">
            <PrimaryButton variant="secondary" className="w-full h-14 text-lg" fullWidth>
              {t.landing.haveLink}
              <UserPlus className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/50 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">{t.landing.whyTitle}</h2>
        <ul className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <BenefitItem text={t.landing.benefits.binding} />
          <BenefitItem text={t.landing.benefits.secure} />
          <BenefitItem text={t.landing.benefits.free} />
          <BenefitItem text={t.landing.benefits.types} />
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
