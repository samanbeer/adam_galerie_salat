import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adam Galerie Salát 🥗📸',
  description: 'Chronologická galerie fotek podle data focení s podporou Telegram bota',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
