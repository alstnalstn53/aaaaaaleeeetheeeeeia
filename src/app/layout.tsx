import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aletheia',
  description: 'AI knows everything. Except what only you can create.',
  openGraph: {
    title: 'Aletheia',
    description: 'Discover what you can\'t see about yourself',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased" style={{ fontFamily: "'Inter', 'Helvetica Neue', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
