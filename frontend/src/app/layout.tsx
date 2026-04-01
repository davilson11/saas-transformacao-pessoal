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
        <body className="min-h-screen antialiased overflow-x-hidden">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}