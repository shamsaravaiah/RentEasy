import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CheckCircle2, ArrowRight, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-8 md:py-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          RentEasy
        </h1>
        <p className="text-xl md:text-2xl font-medium text-foreground">
          Trygga hyreskontrakt med BankID.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
          Skapa juridiskt bindande hyreskontrakt på minuter. Vi verifierar båda parter och signerar digitalt. Säkert, enkelt och gratis att använda.
        </p>

        <div className="flex flex-col w-full gap-4 mt-4 sm:max-w-md">
          <Link href="/contracts/new" className="w-full">
            <PrimaryButton className="w-full h-14 text-lg" fullWidth>
              Skapa kontrakt
              <ArrowRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </Link>

          <Link href="/invite/enter" className="w-full">
            {/* Note: I'm directing to a new route /invite/enter for manual token entry if needed, 
                 or maybe just reusing the logic. The requirement said "shows input field" for CTA 2.
                 For now, I'll point to a conceptual '/invite/enter' or just creating it. 
                 Actually, the prompt said: "Create contract" -> /contracts/new, "I have a contract link" -> /invite/[token].
                 But users won't know the token URL manually. 
                 The prompt says "shows input field". I should probably make a small client component or just a separate page for entering token.
                 I'll link to `/invite/join` for now and implement that page later or inline here.
                 Actually, to keep it simple as requested, I can make a simple page /invite which asks for token. 
                 Or simply pointing to /contracts ensures they are logged in? 
                 Let's stick to the plan: Link to /invite which I will create as a simple page to enter token.
             */}
            <PrimaryButton variant="secondary" className="w-full h-14 text-lg" fullWidth>
              Jag har en kontraktslänk
              <UserPlus className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/50 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Varför RentEasy?</h2>
        <ul className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <BenefitItem text="Juridiskt bindande med BankID" />
          <BenefitItem text="Säker identifiering av båda parter" />
          <BenefitItem text="Helt gratis att använda" />
          <BenefitItem text="Fungerar för hyresrätt, bostadsrätt och hus" />
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
