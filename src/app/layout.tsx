import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'Live Code — Shopify Component Builder',
  description: 'Build, preview, and export Shopify Liquid theme components with live preview and AI assistance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
