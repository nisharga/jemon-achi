import type { ReactNode } from 'react';
import BottomMenu from '@/components/public/common/BottomMenu';
import { Footer } from '@/components/public/shared/footer';
import { Navbar } from '@/components/public/shared/navbar';
import { getCategories, getTopBarMessages } from '@/server/storefront-api';

type Props = {
    children: ReactNode;
    /** The home page header floats over its banner. */
    isHome?: boolean;
};

/**
 * Header, footer and phone bottom menu around every storefront page.
 *
 * The home page (src/app/(public)/page.tsx) passes `isHome`; every other
 * page gets it from its route group layout. So the header never needs to read
 * the URL and is part of the first HTML on every page.
 */
export default async function StorefrontFrame({
    children,
    isHome = false
}: Props) {
    // Fetched on the server (cached), so the header is complete in the first HTML.
    const [categories, topBarMessages] = await Promise.all([
        getCategories(),
        getTopBarMessages()
    ]);

    return (
        <main className='overflow-x-hidden bg-[#f8f6f3]'>
            <Navbar
                isHome={isHome}
                categories={categories}
                topBarMessages={topBarMessages}
            />
            {/* At least one screen tall: the footer starts below the fold, so
                pages that load their content in the browser don't push it
                around on screen (layout shift). */}
            <div className='min-h-screen'>{children}</div>
            <BottomMenu />
            <Footer />
        </main>
    );
}
