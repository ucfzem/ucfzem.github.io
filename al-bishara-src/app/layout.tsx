import type { Metadata, Viewport } from 'next';
import { Amiri, Aref_Ruqaa, Cairo, Noto_Naskh_Arabic, Scheherazade_New } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';

const amiri = Amiri({
  subsets: ['arabic'],
  variable: '--font-amiri',
  display: 'swap',
  weight: ['400', '700'],
});

const aref = Aref_Ruqaa({
  subsets: ['arabic'],
  variable: '--font-aref',
  display: 'swap',
  weight: ['400', '700'],
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-naskh',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const scheherazade = Scheherazade_New({
  subsets: ['arabic'],
  variable: '--font-scheherazade',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'البشارة بنبي الإسلام في كتب اليهود والنصارى',
  description: 'د. سامي عامري — البشارة بنبي الإسلام في كتب اليهود والنصارى (الطبعة الثانية)',
  metadataBase: new URL('https://ucfzem.github.io/al-bishara'),
  manifest: '/al-bishara/manifest.webmanifest',
  icons: {
    icon: '/al-bishara/icons/icon-192.png',
    apple: '/al-bishara/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#8a6d3b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${amiri.variable} ${aref.variable} ${cairo.variable} ${naskh.variable} ${scheherazade.variable} content`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <a href="#content" className="skip-link">
            الانتقال إلى المحتوى الرئيسي
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
