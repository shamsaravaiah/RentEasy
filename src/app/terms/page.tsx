export default function TermsPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Användarvillkor</h1>

            <div className="prose dark:prose-invert">
                <p className="text-lg mb-6">Senast uppdaterad: 2026-01-21</p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">1. Användning av tjänsten</h2>
                    <p className="text-muted-foreground">
                        RentEasy tillhandahåller en plattform för digitala hyreskontrakt. Genom att använda tjänsten godkänner du dessa villkor. Du måste vara minst 18 år och ha ett giltigt BankID för att använda tjänsten.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">2. Juridiskt ansvar</h2>
                    <p className="text-muted-foreground">
                        RentEasy tillhandahåller mallar och verktyg för kontraktsskrivning men är inte part i hyresavtalet. Hyresvärd och hyresgäst ansvarar själva för att innehållet i kontraktet är korrekt och följer gällande lagstiftning.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">3. Personuppgifter</h2>
                    <p className="text-muted-foreground">
                        Vi värnar om din integritet. Se vår integritetspolicy för information om hur vi hanterar dina personuppgifter.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">4. Ändringar av villkor</h2>
                    <p className="text-muted-foreground">
                        Vi förbehåller oss rätten att ändra dessa villkor. Väsentliga ändringar meddelas via tjänsten.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Kontakt</h2>
                    <p className="text-muted-foreground">
                        Vid frågor om villkoren, kontakta oss på support@renteasy.se.
                    </p>
                </section>
            </div>
        </div>
    );
}
