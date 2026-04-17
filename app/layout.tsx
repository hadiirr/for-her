import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'hi, love',
  description: 'a little window into what I\'m up to',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
