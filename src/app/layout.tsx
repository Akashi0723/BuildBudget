import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'BuildBudget PH — Plan smart. Build with confidence.',
  description: 'Explore your Philippine construction budget with transparent preliminary estimates, planning tools, and saved project reports.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
