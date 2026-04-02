import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased overflow-x-hidden">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}