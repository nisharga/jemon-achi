import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DM_Sans } from 'next/font/google';
import '@/admin/styles/globals.css';
import { Toaster } from 'sonner';
import StoreProvider from '@/admin/provider/store-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const dmSans = DM_Sans({
    variable: '--font-dm-sans',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Griipbuddy Admin',
    description: 'Griipbuddy Admin Control Panel'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <StoreProvider>
            <html lang='en'>
                <body className={`${dmSans.variable} font-sans antialiased`}>
                    <NuqsAdapter>
                        {/* The dashboard is client-rendered and reads the URL/params everywhere;
          with cacheComponents those reads must sit inside Suspense, so admin
          pages stream in at request time. */}
                        <Suspense fallback={null}>{children}</Suspense>
                        <Toaster position='top-center' richColors />
                    </NuqsAdapter>
                </body>
            </html>
        </StoreProvider>
    );
}
