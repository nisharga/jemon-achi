import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Suspense, type ReactNode } from 'react';
import '@/styles/public-globals.css';
import { FRONTEND_URL, META_PIXEL_ID } from '@/configs/storefront';
import ProviderWrapper from '@/providers/public-store-provider';
import { MetaPixelPageViewTracker, ThirdPartyScripts } from '@/components';

// The storefront's only font. `display: swap` shows text immediately in a
// fallback font instead of hiding it while the font downloads.
const acuminPro = localFont({
    src: '../../assets/fonts/AcuminPro-Regular.ttf',
    variable: '--font-acumin',
    display: 'swap'
});

export const metadata: Metadata = {
    metadataBase: new URL(FRONTEND_URL),
    title: {
        default: 'Griipbuddy',
        template: '%s | Griipbuddy'
    },
    description: 'Shop leather bags, wallets, belts, footwear and accessories.'
};

/** Root layout of the storefront: every page outside /landing and /admin. */
export default function PublicRootLayout({
    children
}: Readonly<{ children: ReactNode }>) {
    return (
        // The font variable lives on <html> so Tailwind's --font-primary can use it.
        <html lang='en' className={acuminPro.variable}>
            {/* Browser extensions inject attributes into <body>; ignore those mismatches. */}
            <body
                className='!font-primary antialiased'
                suppressHydrationWarning
            >
                <ProviderWrapper>
                    {/* Reads the URL (useSearchParams), so it needs its own Suspense. */}
                    <Suspense fallback={null}>
                        <MetaPixelPageViewTracker />
                    </Suspense>
                    {children}
                </ProviderWrapper>
                <ThirdPartyScripts />
                {/* Meta Pixel for visitors without JavaScript. */}
                <noscript>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                        height='1'
                        width='1'
                        style={{ display: 'none' }}
                        alt=''
                    />
                </noscript>
            </body>
        </html>
    );
}
