import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SwRegister from "@/components/SwRegister";

export const metadata: Metadata = {
  title: "Kairos — Seu Momento de Virada",
  description:
    "Um sistema completo com 16 ferramentas guiadas para transformar todas as áreas da sua vida. Sem tela em branco. Sem confusão.",
  openGraph: {
    title: "Kairos — Seu Momento de Virada",
    description:
      "Um sistema completo com 16 ferramentas guiadas para transformar todas as áreas da sua vida.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="pt-BR">
        <head>
          <meta name="theme-color" content="#C8A030" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Kairos" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased overflow-x-hidden">
          <SwRegister />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}