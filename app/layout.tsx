import type {Metadata} from 'next';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { AuthProvider } from '@/components/AuthProvider';


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'KWATE',
  description: 'Services, ventes et échanges consommables autour de vous au Cameroun.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr">
      <body className="bg-zinc-950 text-white selection:bg-green-500/30 font-sans" suppressHydrationWarning>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
