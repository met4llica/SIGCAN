import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/app-sidebar';

export const metadata: Metadata = {
  title: 'SIGCAN - Castración y Chipeo Animal',
  description: 'Sistema de gestión de turnos y registro de castración/chipeo de canes — Municipio de Río Grande',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background">
        <div className="lg:flex lg:min-h-screen">
          <AppSidebar />
          <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
