import {
    FONT_DEFAULT,
    SITE_DESCRIPTION_DEFAULT,
    SITE_TITLE_DEFAULT,
    SITE_TITLE_TEMPLATE_DEFAULT,
    SITE_VERIFICATION_GOOGLE_DEFAULT
} from '@/configs';
import { PLAUSIBLE_SRC, SITE_DOMAIN } from '@/configs/env';
import { switchThemeDuration } from '@/configs/switch-theme-duration';
import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import PlausibleProvider from 'next-plausible';
import React from 'react';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_DOMAIN),
    title: {
        default: SITE_TITLE_DEFAULT,
        template: SITE_TITLE_TEMPLATE_DEFAULT
    },
    description: SITE_DESCRIPTION_DEFAULT,
    verification: {
        google: SITE_VERIFICATION_GOOGLE_DEFAULT
    },
    icons: {
        icon: {
            url: '/favicon.svg',
            type: 'image/svg+xml'
        }
    }
};

/** Wraps children in Plausible analytics only when a script URL is configured. */
const Analytics = ({ children }: { children: React.ReactNode }) =>
    PLAUSIBLE_SRC ? (
        <PlausibleProvider src={PLAUSIBLE_SRC}>{children}</PlausibleProvider>
    ) : (
        <>{children}</>
    );

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // The font CSS variable must live on <html> (:root): Tailwind v4 resolves
        // `--font-primary: var(--font-be-vietnam-pro)` on :root, so defining the
        // variable lower down (on <body>) breaks the chain and falls back to the
        // system font.
        <html
            lang='en'
            className={`${FONT_DEFAULT.variable} scroll-smooth`}
            // Lets Next.js turn smooth scrolling off during route transitions.
            data-scroll-behavior='smooth'
            // next-themes sets the theme class before hydration.
            suppressHydrationWarning
        >
            {/* Browser extensions (password managers, colour pickers…) inject
                attributes into <body>; ignore those one-level mismatches. */}
            <body className={switchThemeDuration} suppressHydrationWarning>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                >
                    <Analytics>
                        <main>{children}</main>
                    </Analytics>
                    <Toaster position='top-center' richColors />
                </ThemeProvider>
            </body>
        </html>
    );
}
