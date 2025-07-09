import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}