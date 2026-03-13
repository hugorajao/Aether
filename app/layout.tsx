import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400'],
});

export const metadata: Metadata = {
  title: 'Aether — An AI Art Gallery',
  description:
    'A museum-grade digital art gallery housing algorithmically generated masterworks and community-submitted AI art.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="bg-void-950 text-ivory-50 font-body antialiased min-h-screen">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="skip-link"
        >
          Skip to navigation
        </a>
        {children}
      </body>
    </html>
  );
}
