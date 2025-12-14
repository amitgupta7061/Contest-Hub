import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'ContestTracker - Never Miss a Programming Contest',
  description: 'Track upcoming programming contests from LeetCode, Codeforces, CodeChef, and more platforms in one place.',
  keywords: ['programming', 'contests', 'leetcode', 'codeforces', 'codechef', 'competitive programming'],
  authors: [{ name: 'ContestTracker' }],
  openGraph: {
    title: 'ContestTracker - Never Miss a Programming Contest',
    description: 'Track upcoming programming contests from multiple platforms in one place.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}