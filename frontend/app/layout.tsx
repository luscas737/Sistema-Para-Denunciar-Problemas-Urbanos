import type { Metadata } from 'next';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Denuncias Urbanas',
  description: 'Sistema para denunciar problemas urbanos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <header className="bg-white border-b border-slate-200">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg">
              Denuncias Urbanas
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="hover:text-blue-600">
                Inicio
              </Link>
              <Link href="/denuncias" className="hover:text-blue-600">
                Denuncias
              </Link>
              <Link href="/mapa" className="hover:text-blue-600">
                Mapa
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
