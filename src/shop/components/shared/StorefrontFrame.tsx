import type { ReactNode } from 'react';
import BottomMenu from '@/shop/components/common/BottomMenu';
import { Footer } from '@/shop/components/shared/footer';
import { Navbar } from '@/shop/components/shared/navbar';

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
export default function StorefrontFrame({ children, isHome = false }: Props) {
    return (
        <main className='overflow-x-hidden bg-[#f8f6f3]'>
            <Navbar isHome={isHome} />
            {/* At least one screen tall: the footer starts below the fold, so
                pages that load their content in the browser don't push it
                around on screen (layout shift). */}
            <div className='min-h-screen'>{children}</div>
            <BottomMenu />
            <Footer />
        </main>
    );
}
