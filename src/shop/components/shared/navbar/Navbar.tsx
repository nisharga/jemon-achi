'use client';

import { useEffect, useState } from 'react';
import { Menu, Search, TicketPercent, Truck } from 'lucide-react';
import { useGetAllCategoriesQuery } from '@/shop/redux/api/category-api';
import { cn, isDesktop } from '@/shop/lib/utils';
import DesktopSearch from '../DesktopSearch';
import MobileMenu from '../MobileMenu';
import MobileSearch from '../MobileSearch';
import AccountMenu from './AccountMenu';
import CartButton from './CartButton';
import CategoryMenu from './CategoryMenu';
import IconLink from './IconLink';
import Logo from './Logo';
import MegaMenu from './MegaMenu';
import TopBar from './TopBar';
import type { NavCategory } from './types';

/**
 * Site header. On the home page (`isHome`) it floats over the banner and
 * sticks to the top once the visitor scrolls; elsewhere it is always sticky.
 */
export default function Navbar({ isHome = false }: { isHome?: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const isScrolled = useIsScrolled(isHome);

    const { data } = useGetAllCategoriesQuery({});
    const categories: NavCategory[] = (data?.data?.data ?? []).filter(
        (category: NavCategory) => category.is_published
    );
    const subcategories =
        categories.find((category) => category.name_en === hoveredCategory)
            ?.subcategories ?? [];

    return (
        <header
            onMouseLeave={() => setHoveredCategory(null)}
            className={cn(
                'left-0 z-50 w-full transition-all',
                !isHome && 'sticky top-0',
                isHome && (isScrolled ? 'fixed top-0' : 'absolute top-0')
            )}
        >
            <TopBar />

            <div className='px-2 lg:px-4'>
                <nav
                    aria-label='Main'
                    className='mx-auto flex h-12 items-center justify-between gap-4 rounded-3xl bg-white px-6 shadow-sm lg:h-16'
                >
                    <Logo />

                    {/* Desktop: categories, search and icons */}
                    <div className='hidden h-full flex-1 items-center gap-8 pl-4 lg:flex'>
                        <CategoryMenu
                            categories={categories}
                            activeName={hoveredCategory}
                            onHover={setHoveredCategory}
                        />
                        <DesktopSearch />
                    </div>
                    <div className='hidden items-center gap-4 lg:flex'>
                        <IconLink
                            href='/offers'
                            icon={<TicketPercent className='size-5' />}
                        >
                            Offers
                        </IconLink>
                        <IconLink
                            href='/track'
                            label='Track your order'
                            icon={<Truck className='size-5' />}
                        />
                        <CartButton />
                        <AccountMenu />
                    </div>

                    {/* Phones: search and menu buttons */}
                    <div className='flex items-center gap-2 lg:hidden'>
                        <button
                            type='button'
                            onClick={() => setIsMobileSearchOpen(true)}
                            aria-label='Open search'
                            className='text-primary-ink rounded-full p-2 hover:bg-primary/20'
                        >
                            <Search className='size-5' aria-hidden='true' />
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            aria-label='Open menu'
                            aria-expanded={isMobileMenuOpen}
                            className='text-primary-ink rounded-md p-2 hover:bg-primary/20'
                        >
                            <Menu className='size-6' aria-hidden='true' />
                        </button>
                    </div>
                </nav>

                {subcategories.length > 0 && (
                    <MegaMenu subcategories={subcategories} />
                )}

                <MobileSearch
                    isOpen={isMobileSearchOpen}
                    onClose={() => setIsMobileSearchOpen(false)}
                />
                <MobileMenu
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    categoriesData={categories}
                />
            </div>
        </header>
    );
}

/** True once the page is scrolled down (only tracked on the home page). */
function useIsScrolled(enabled: boolean) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        // On desktop the header floats over the tall banner for longer.
        const threshold = isDesktop ? 1200 : 0;
        const onScroll = () => setIsScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [enabled]);

    return isScrolled;
}
