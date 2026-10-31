import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'EUnistud | Your study abroad companion', description: 'Discover your study abroad options.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html>; }
