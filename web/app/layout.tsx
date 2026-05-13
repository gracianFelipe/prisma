import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CursorHalo } from "@/components/CursorHalo";
import { CourseTracker } from "@/components/CourseTracker";

export const metadata: Metadata = {
  title: "ESUP News — Jornal universitário",
  description:
    "As notícias mais atuais dos cursos da ESUP em um só lugar. Direito, Administração, Sistemas da Informação, Processos Gerenciais, Pedagogia, Ciências Contábeis e Psicologia.",
  applicationName: "ESUP News",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-ink text-paper antialiased">
        <CursorHalo />
        <ScrollProgress />
        <Header />
        <main className="relative z-10">{children}</main>
        <CourseTracker />
        <Footer />
      </body>
    </html>
  );
}
