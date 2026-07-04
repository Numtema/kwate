import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from "next/font/google";
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { MockProvider } from '@/components/MockProvider';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: 'KWATE',
  description: 'Services, ventes et échanges consommables autour de vous au Cameroun.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className={`${inter.variable} ${space.variable}`}>
      <body className="bg-zinc-950 text-white selection:bg-green-500/30 font-sans" suppressHydrationWarning>
        <MockProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </MockProvider>
      </body>
    </html>
  );
}
