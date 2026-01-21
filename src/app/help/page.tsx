import { HelpCircle } from "lucide-react";

// Minimal Accordion Implementation since I can't use detailed external UI libs, but I'll make a custom one inline or assuming shadcn-like structure if I had it. 
// Wait, I don't have shadcn components installed. I need to build a simple accordion or just use details/summary.
// The user said "No external UI libraries - build simple, custom components". 
// I will implement a simple Accordion here or just use standard details/summary which is accessible and native.

export default function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8">
                <HelpCircle className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Hjälp & FAQ</h1>
            </div>

            <div className="space-y-4">
                <FaqItem
                    question="Är detta juridiskt bindande?"
                    answer="Ja, kontrakt signerade med BankID har samma juridiska status som handskrivna kontrakt. Det regleras enligt svensk avtalslag."
                />
                <FaqItem
                    question="Hur fungerar BankID-signering?"
                    answer="När du signerar med BankID skapas en digital signatur som säkerställer din identitet och att innehållet inte ändrats efter signering. Båda parter måste signera för att kontraktet ska bli giltigt."
                />
                <FaqItem
                    question="Vad händer vid konflikter?"
                    answer="Kontraktet du skapar följer svensk hyreslagstiftning. Om en konflikt uppstår som ni inte kan lösa själva, kan ni vända er till Hyresnämnden för medling."
                />
                <FaqItem
                    question="Kostar det något att använda RentEasy?"
                    answer="Nej, RentEasy är helt gratis att använda för både hyresvärdar och hyresgäster. Vi tror på att trygg bostadsuthyrning ska vara tillgänglig för alla."
                />
                <FaqItem
                    question="Hur raderar jag ett kontrakt?"
                    answer="Om ni vill avsluta eller radera ett kontrakt, kontakta spport@renteasy.se så hjälper vi er med detta."
                />
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg text-center">
                <h2 className="font-semibold text-lg mb-2">Hittade du inte svaret?</h2>
                <p className="text-muted-foreground">
                    Kontakta oss på <a href="mailto:support@renteasy.se" className="text-primary underline">support@renteasy.se</a>
                </p>
            </div>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <details className="group border rounded-lg bg-card">
            <summary className="flex cursor-pointer items-center justify-between p-4 font-medium list-none">
                <span>{question}</span>
                <span className="transition-transform group-open:rotate-180">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </summary>
            <div className="px-4 pb-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t group-open:border-t-0 border-transparent">
                <div className="pt-2">{answer}</div>
            </div>
        </details>
    );
}
