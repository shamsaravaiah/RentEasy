import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RentEasy - Trygga hyreskontrakt med BankID",
  description: "Skapa juridiskt bindande hyreskontrakt med BankID. Säkert, enkelt och digitalt för både hyresvärdar och hyresgäster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
