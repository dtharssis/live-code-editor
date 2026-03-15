import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'Live Editor',
  description: 'Real-time HTML & Shopify Liquid code editor',
  authors:     [{ name: 'dtharssis', url: 'https://github.com/dtharssis' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
