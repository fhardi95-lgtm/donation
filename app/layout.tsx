import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aidons un frère à retrouver son épouse | Cagnotte solidaire',
  description: 'Une cagnotte solidaire pour aider un jeune marié à financer son voyage afin de rejoindre son épouse à Djibouti.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
