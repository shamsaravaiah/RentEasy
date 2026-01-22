"use client";

import { useTranslation } from "@/context/LanguageContext";

export default function PrivacyPage() {
    const { t } = useTranslation();

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>

            <div className="prose dark:prose-invert">
                <p className="text-lg mb-6">{t('privacy.lastUpdated')} 2026-01-21</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Vilka uppgifter samlar vi in?</h2>
                    <p className="text-muted-foreground mb-2">
                        För att tillhandahålla tjänsten samlar vi in följande information:
                    </p>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                        <li>Namn och personnummer (via BankID)</li>
                        <li>Kontaktuppgifter (telefon, e-post)</li>
                        <li>Information om hyresobjektet och kontraktet</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Hur använder vi uppgifterna?</h2>
                    <p className="text-muted-foreground">
                        Uppgifterna används uteslutande för att:
                    </p>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
                        <li>Verifiera din identitet</li>
                        <li>Skapa och hantera hyreskontrakt</li>
                        <li>Kommunicera med dig gällande tjänsten</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Hur delar vi uppgifter?</h2>
                    <p className="text-muted-foreground">
                        Dina uppgifter delas endast med din kontraktspart. Vi delar aldrig dina uppgifter med tredje part för marknadsföringsändamål.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Dina rättigheter</h2>
                    <p className="text-muted-foreground">
                        Du har rätt att begära utdrag, rättelse eller radering av dina uppgifter. Du kan när som helst återkalla ditt samtycke.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
                    <p className="text-muted-foreground">
                        Dataskyddsombud: privacy@renteasy.se
                    </p>
                </section>
            </div>
        </div>
    );
}
