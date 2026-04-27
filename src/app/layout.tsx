import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Code Aventureiro',
    template: '%s · Code Aventureiro',
  },
  description: 'Blog pessoal de um dev front-end registrando projetos, bugs e estudos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
