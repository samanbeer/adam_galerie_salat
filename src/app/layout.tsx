import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adam Salát — Galerie',
  description: 'Chronologická fotografická galerie seřazená podle data pořízení',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
