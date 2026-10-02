import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// Instrument Sans (UI) dan Instrument Serif (display) satu keluarga, jadi pasangannya serasi.
const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const SITE_URL = 'https://aldreinevanda.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Aldreine Vanda Kauntu — Data Analyst',
  description:
    'Data Analyst and Computer Science (Database) student at BINUS. ETL pipelines, star schemas, and Power BI/Tableau dashboards.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Aldreine Vanda Kauntu — Data Analyst',
    description: 'ETL pipelines, star schemas, and dashboards that answer real business questions.',
    siteName: 'Aldreine Vanda Kauntu',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#ece2e1',
  width: 'device-width',
  initialScale: 1,
};

// Sebelum render pertama: kelas `js` (reveal tidak menyembunyikan konten tanpa JS) dan
// kelas `intro` (layar pembuka nama, sekali per sesi, dilewati untuk reduced motion).
const JS_FLAG = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!sessionStorage.getItem('intro-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&location.hash===''&&scrollY===0)d.classList.add('intro')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
