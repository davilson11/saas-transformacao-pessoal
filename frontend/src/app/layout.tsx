import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Virada — Transforme Sua Vida em 12 Meses",
  description:
    "Um sistema completo com 16 ferramentas guiadas para transformar todas as áreas da sua vida. Sem tela em branco. Sem confusão.",
  openGraph: {
    title: "A Virada — Transforme Sua Vida em 12 Meses",
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
    <html lang="pt-BR">
      <body className="min-h-screen antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}