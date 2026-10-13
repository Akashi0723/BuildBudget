import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';
import './motion.css';
export const metadata: Metadata = {
  title: 'BuildBudget — Plan smart. Build with confidence.',
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  description: 'Explore your Philippine construction budget with transparent preliminary estimates, planning tools, and saved project reports.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
