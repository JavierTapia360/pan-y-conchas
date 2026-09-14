import type { Metadata } from 'next';
import { Anton, Inter } from 'next/font/google';
import { LanguageProvider } from '@/components/language-provider';
import { AgeGate } from '@/components/age-gate';
import { CartProvider } from '@/components/cart-provider';
import { CatalogCartProvider } from '@/components/catalog-cart-provider';
import { CatalogCartToast } from '@/components/catalog-cart-toast';
import { SelectionProvider } from '@/components/selection-provider';
import { SelectionToast } from '@/components/selection-toast';
import { ComparisonTray } from '@/components/comparison-tray';
import { WebMcpTools } from '@/components/webmcp-tools';
import { AnalyticsProvider } from '@/components/analytics-provider';
import './globals.css';
import './marketplace.css';

const display = Anton({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});
const body = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cuatesfarmz.estradajokabet380.chatgpt.site'),
  title: {
    default: 'CUATESFARMZ — Flower & Wax',
    template: '%s — CUATESFARMZ',
  },
  description:
    'Premium flower and wax culture. Availability subject to applicable law.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-language-ready="false" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable}`}>
        <noscript>
          <style>{`html body{opacity:1!important}`}</style>
        </noscript>
        <LanguageProvider>
          <CartProvider>
            <CatalogCartProvider>
              <SelectionProvider>
                <a className="skip-link" href="#page-content">
                  Skip to content
                </a>
                <AgeGate />
                <AnalyticsProvider />
                <WebMcpTools />
                <div id="page-content">{children}</div>
                <SelectionToast />
                <ComparisonTray />
                <CatalogCartToast />
              </SelectionProvider>
            </CatalogCartProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
