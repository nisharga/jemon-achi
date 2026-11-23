/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    Search,
    User,
    ChevronDown,
    ShoppingCart,
    TicketPercent,
    Truck
} from 'lucide-react';
import Image from 'next/image';
import { mockSearchData, type SearchProduct } from '@/shop/lib/data';
import { usePathname, useRouter } from 'next/navigation';

import { useAppSelector } from '@/shop/redux/store';
// import { openCart, toggleCart } from "@/shop/redux/features/cart-slice";

import MobileSearch from './MobileSearch';
import { popoverVariants } from '@/shop/types/navbar';
import { removeUser, removeVendorId } from '@/shop/lib/user-store';
import { removeAccessToken } from '@/shop/lib/cookies';
import DesktopSearch from './DesktopSearch';
import { selectCartCount } from '@/shop/redux/features/cart-slice';
import Cookies from 'js-cookie';
import { containerNav, itemNav } from '@/shop/lib/variants';
import { cn, isDesktop } from '@/shop/lib/utils';
import { useGetAllCategoriesQuery } from '@/shop/redux/api/category-api';
import { useGetTopBarMessagesQuery } from '@/shop/redux/api/topbar-api';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import MobileMenu from './MobileMenu';
import { useUser } from '@/shop/hooks/use-user';

interface SubCategory {
    name: string;
    path: string;
}

interface Category {
    name: string;
    path: string;
    subcategories: SubCategory[];
}

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
    const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecommendations, setFilteredRecommendations] = useState<
        SearchProduct[]
    >([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] =
        useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [openMobileSubcategory, setOpenMobileSubcategory] = useState<
        string | null
    >(null);

    // more dropdown state
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const [maxVisibleCategories, setMaxVisibleCategories] = useState(6);
    const moreDropdownRef = useRef<HTMLDivElement>(null);

    // ============== User API  ================
    const { user, isLoading: isUserLoading, isMounted } = useUser();

    // ============== Cart API  ================
    const cartCount = useAppSelector(selectCartCount);
    const totalItems = isMounted ? cartCount : 0;

    // ============== Ref API  ================
    const searchRef = useRef<HTMLDivElement>(null);
    const loginRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ============== Category API  ================
    const { data, isLoading } = useGetAllCategoriesQuery({});
    const categories = data?.data?.data || [];

    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setIsSearchPopoverOpen(false);
            }
            if (
                loginRef.current &&
                !loginRef.current.contains(event.target as Node)
            ) {
                setIsLoginDropdownOpen(false);
            }
            if (
                moreDropdownRef.current &&
                !moreDropdownRef.current.contains(event.target as Node)
            ) {
                setIsMoreDropdownOpen(false);
            }
        };

        const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchPopoverOpen(false);
                setIsLoginDropdownOpen(false);
                setIsMoreDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    // Handle responsive categories visibility
    // const MAX_VISIBLE_CATEGORIES = 6;
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1280) {
                setMaxVisibleCategories(7);
            } else {
                setMaxVisibleCategories(5);
            }
        };

        // Set initial value on mount
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Desktop search effect
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (searchTerm.length > 0) {
            setIsLoadingRecommendations(true);
            searchTimeoutRef.current = setTimeout(() => {
                const filtered = mockSearchData.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredRecommendations(filtered);
                setIsLoadingRecommendations(false);
                setIsSearchPopoverOpen(true);
            }, 300);
        } else {
            setFilteredRecommendations([]);
            setIsLoadingRecommendations(false);
            setIsSearchPopoverOpen(false);
        }
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    const handleLogOut = async () => {
        removeUser();
        Cookies.remove('token');
        removeAccessToken();
        removeVendorId();
        window.location.reload();
    };

    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        // Only add scroll listener if we are on the homepage
        if (!isHome) return;
        const handleScroll = () => {
            // Toggle sticky state after 100px
            if (window.scrollY > (isDesktop ? 1200 : 0)) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const pathname = usePathname();
    const isHome = pathname === '/';

    // Category - Sub Category
    const activeCategory = categories?.find(
        (cat: any) => cat.name_en === activeMenu
    );
    const hasSubcategories = (activeCategory?.subcategories?.length ?? 0) > 0;

    return (
        <header
            lang='en'
            // className={` `}
            className={cn(
                // Base classes
                'left-0 z-[50] w-full text-primary transition-all',
                // Conditional Classes based on scroll
                isHome
                    ? isSticky
                        ? 'fixed top-0 translate-y-0'
                        : 'absolute top-0 -translate-y-1 bg-transparent'
                    : // Logic for all other pages (Static/Fixed)
                      'sticky top-0'
            )}
            onMouseLeave={() => setActiveMenu(null)}
        >
            <TopBar />
            <section className='px-2 lg:px-4'>
                <div className='mx-auto flex h-12 items-center justify-between rounded-3xl bg-white px-6 shadow-sm lg:h-16'>
                    <div className='flex w-full items-center justify-between py-1 sm:gap-4'>
                        <div className='flex w-full items-center justify-between'>
                            <Logo />

                            <motion.div
                                variants={containerNav}
                                initial='hidden'
                                animate='visible'
                                className='hidden h-full items-center gap-8 pl-4 lg:flex'
                            >
                                {/* Filter only published categories */}
                                {(() => {
                                    const publishedCategories =
                                        categories?.filter(
                                            (item: any) => item?.is_published
                                        ) || [];
                                    const visibleCategories =
                                        publishedCategories.slice(
                                            0,
                                            maxVisibleCategories
                                        );
                                    const moreCategories =
                                        publishedCategories.slice(
                                            maxVisibleCategories
                                        );

                                    return (
                                        <>
                                            {visibleCategories?.map(
                                                (item: any) => {
                                                    const name =
                                                        item?.name_en || '';
                                                    return (
                                                        <motion.div
                                                            variants={itemNav}
                                                            key={name}
                                                            className='nav-link relative flex h-full cursor-pointer items-center hover:text-black'
                                                            onMouseEnter={() =>
                                                                setActiveMenu(
                                                                    name
                                                                )
                                                            }
                                                        >
                                                            {name}
                                                            {/* Animated underline indicator */}
                                                            {activeMenu ===
                                                                name && (
                                                                <motion.div
                                                                    layoutId='underline'
                                                                    className='absolute right-0 -bottom-1 left-0 h-0.5 bg-black'
                                                                />
                                                            )}
                                                        </motion.div>
                                                    );
                                                }
                                            )}

                                            {/* Show More button if there are more than 5 categories */}
                                            {moreCategories.length > 0 && (
                                                <div
                                                    className='relative'
                                                    ref={moreDropdownRef}
                                                >
                                                    <motion.button
                                                        variants={itemNav}
                                                        onClick={() =>
                                                            setIsMoreDropdownOpen(
                                                                !isMoreDropdownOpen
                                                            )
                                                        }
                                                        className='nav-link group relative flex h-full cursor-pointer items-center gap-1.5 transition-colors hover:text-black'
                                                        aria-label='More categories'
                                                        aria-expanded={
                                                            isMoreDropdownOpen
                                                        }
                                                    >
                                                        More
                                                        <ChevronDown
                                                            className={`size-4 transition-transform ${
                                                                isMoreDropdownOpen
                                                                    ? 'rotate-180'
                                                                    : ''
                                                            }`}
                                                        />
                                                        {activeMenu &&
                                                            moreCategories.some(
                                                                (cat: any) =>
                                                                    cat.name_en ===
                                                                    activeMenu
                                                            ) && (
                                                                <motion.div
                                                                    layoutId='underline'
                                                                    className='absolute right-0 -bottom-1 left-0 h-0.5 bg-black'
                                                                />
                                                            )}
                                                    </motion.button>

                                                    {/* Dropdown Menu */}
                                                    <AnimatePresence>
                                                        {isMoreDropdownOpen && (
                                                            <motion.div
                                                                initial='hidden'
                                                                animate='visible'
                                                                exit='exit'
                                                                variants={
                                                                    popoverVariants as any
                                                                }
                                                                className='absolute top-full left-0 z-[9999] mt-5 min-w-max overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'
                                                            >
                                                                <ul className='py-2'>
                                                                    {moreCategories?.map(
                                                                        (
                                                                            item: any
                                                                        ) => {
                                                                            const name =
                                                                                item?.name_en ||
                                                                                '';
                                                                            return (
                                                                                <li
                                                                                    key={
                                                                                        name
                                                                                    }
                                                                                >
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setActiveMenu(
                                                                                                name
                                                                                            );
                                                                                            setIsMoreDropdownOpen(
                                                                                                false
                                                                                            );
                                                                                        }}
                                                                                        onMouseEnter={() =>
                                                                                            setActiveMenu(
                                                                                                name
                                                                                            )
                                                                                        }
                                                                                        className='nav-link block w-full px-4 py-2 text-left transition-colors hover:bg-gray-50 hover:text-primary/80'
                                                                                    >
                                                                                        {
                                                                                            name
                                                                                        }
                                                                                    </button>
                                                                                </li>
                                                                            );
                                                                        }
                                                                    )}
                                                                </ul>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}

                                {/* Desktop Search */}
                                <DesktopSearch />
                            </motion.div>

                            {/* Mobile Controls */}
                            <div className='flex items-center gap-2 lg:hidden'>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='relative rounded-full p-2 transition-colors hover:bg-primary/20'
                                    onClick={() => setIsMobileSearchOpen(true)}
                                    aria-label='Open search'
                                >
                                    <Search className='h-5 w-5 text-primary' />
                                    <motion.div
                                        className='absolute inset-0 rounded-full bg-primary/10'
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </motion.button>

                                <button
                                    className='rounded-md p-2 transition-colors hover:bg-primary/20'
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                    aria-label='Toggle mobile menu'
                                    aria-expanded={isMobileMenuOpen}
                                >
                                    <Menu className='h-6 w-6 text-primary' />
                                </button>
                            </div>
                        </div>

                        {/* right side */}
                        <div className='hidden lg:flex'>
                            {/* Desktop Right Side */}
                            <motion.div
                                variants={containerNav}
                                initial='hidden'
                                animate='visible'
                                className='hidden shrink-0 items-center gap-4 md:flex'
                            >
                                {/* Specialized Link with Icon (Tracking) */}

                                <NavLink
                                    href='/offers'
                                    isActive={activeMenu === 'Offers'}
                                    onMouseEnter={() => setActiveMenu('Offers')}
                                    icon={
                                        <TicketPercent className='nav-link size-5' />
                                    }
                                    className={'mt-1'}
                                >
                                    Offers
                                </NavLink>

                                {/* three icon right side */}
                                <div className='flex items-center gap-4'>
                                    <NavLink
                                        href='/track'
                                        // isActive={activeMenu === "Tracking"}
                                        isActive={false}
                                        onMouseEnter={() =>
                                            setActiveMenu('Tracking')
                                        }
                                        icon={
                                            <Truck className='nav-link size-5' />
                                        }
                                    />

                                    <CartButton
                                        isMounted={isMounted}
                                        totalItems={totalItems}
                                        // isActive={activeMenu === "Cart"}
                                        isActive={false}
                                        onMouseEnter={() =>
                                            setActiveMenu('Cart')
                                        }
                                    />

                                    <div className='relative' ref={loginRef}>
                                        <button
                                            className={`nav-link flex cursor-pointer items-center justify-between`}
                                            onClick={() =>
                                                setIsLoginDropdownOpen(
                                                    !isLoginDropdownOpen
                                                )
                                            }
                                            aria-label='Login or Register'
                                            aria-expanded={isLoginDropdownOpen}
                                        >
                                            <User className='size-5 text-primary' />
                                            {user && (
                                                <span className='nav-link mt-1'>
                                                    {!user ? '' : ''}
                                                </span>
                                            )}
                                            <ChevronDown
                                                className={`mt-1 size-5 text-primary transition-transform ${
                                                    isLoginDropdownOpen
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {isLoginDropdownOpen && (
                                                <motion.div
                                                    initial='hidden'
                                                    animate='visible'
                                                    exit='exit'
                                                    variants={
                                                        popoverVariants as any
                                                    }
                                                    className='absolute top-full right-0 z-40 mt-5 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'
                                                >
                                                    {!user && (
                                                        <ul className='py-1'>
                                                            <li>
                                                                <Link
                                                                    href='/login'
                                                                    className='nav-link block px-4 py-2 transition-colors hover:text-primary/80'
                                                                    onClick={() =>
                                                                        setIsLoginDropdownOpen(
                                                                            false
                                                                        )
                                                                    }
                                                                >
                                                                    Login
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    href='/register'
                                                                    className='nav-link block px-4 py-2 transition-colors hover:text-primary/80'
                                                                    onClick={() =>
                                                                        setIsLoginDropdownOpen(
                                                                            false
                                                                        )
                                                                    }
                                                                >
                                                                    Register
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {user && (
                                                        <ul className='py-1'>
                                                            <li>
                                                                {user?.role ===
                                                                    'USER' && (
                                                                    <Link
                                                                        href='/profile'
                                                                        className='sm-normal-gray nav-link block px-4 py-2 text-primary transition-colors hover:text-primary'
                                                                        onClick={() =>
                                                                            setIsLoginDropdownOpen(
                                                                                false
                                                                            )
                                                                        }
                                                                    >
                                                                        My
                                                                        Profile
                                                                    </Link>
                                                                )}
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className='sm-normal-gray nav-link xs-normal block cursor-pointer px-4 py-2 transition-colors hover:text-red-500'
                                                                    onClick={() => (
                                                                        setIsLoginDropdownOpen(
                                                                            false
                                                                        ),
                                                                        handleLogOut()
                                                                    )}
                                                                >
                                                                    Logout
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Megamenu Animation Layer */}
                    <AnimatePresence>
                        {/* Show menu ONLY if activeCategory exists AND it has subcategories */}
                        {activeMenu && hasSubcategories && (
                            <motion.div
                                key={activeCategory?._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className='absolute top-[100px] left-1/2 z-40 w-full max-w-7xl -translate-x-1/2 px-4'
                            >
                                {/* Pass subcategories as props to your menu component */}
                                <WalletsMenu
                                    subcategories={activeCategory.subcategories}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile Search Overlay */}
                    <MobileSearch
                        isOpen={isMobileSearchOpen}
                        onClose={() => setIsMobileSearchOpen(false)}
                    />

                    {/* Mobile Menu */}
                    <MobileMenu
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        setIsSearchPopoverOpen={setIsSearchPopoverOpen}
                        categoriesData={categories}
                        openMobileSubcategory={openMobileSubcategory}
                        setOpenMobileSubcategory={setOpenMobileSubcategory}
                    />
                </div>
            </section>

            {/* <div className="bg-white">
        <Container className="hidden md:flex items-center justify-between py-2 bg-white">
          <CategoryNav />
        </Container>
      </div> */}
        </header>
    );
};

export default Navbar;

const messages = [
    'Flat Rate | Free Shipping ৳999+ | Duties & Taxes Prepaid',
    'Use Code: GRIIPBUDDY20 for 20% Off Your First Order',
    'New Arrival: MagSafe Charging Pads Now In Stock'
];

const TopBar = () => {
    // Fetch top bar messages from API
    const { data: messagesData, isLoading } = useGetTopBarMessagesQuery({});
    const messages = messagesData?.data || [];
    const [index, setIndex] = useState(0);

    // Only cycle through messages if we have messages
    useEffect(() => {
        if (messages.length === 0) return;

        const timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 4000); // Change text every 4 seconds

        return () => clearInterval(timer);
    }, [messages.length]);

    // Don't render if no messages or loading
    //  if (isLoading) {
    //   return <span className='h-4 md:h-5 pt-2'></span>;
    //  }

    return (
        <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='announcement relative w-full overflow-hidden px-4 !pt-2 pb-1 text-center'
        >
            <div className='relative z-10 flex h-4 items-center justify-center md:h-5'>
                <AnimatePresence mode='wait'>
                    <motion.span
                        key={index}
                        // Entry: Comes from top (y: -20)
                        initial={{ y: -20, opacity: 0 }}
                        // Center: Stationary
                        animate={{ y: 0, opacity: 1 }}
                        // Exit: Goes down (y: 20)
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='absolute text-[12px] font-bold tracking-wide whitespace-nowrap text-white md:text-[14px]'
                    >
                        {messages[index]}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Shine Effect */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: 'linear',
                    repeatDelay: 2
                }}
                className='pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
            />
        </motion.div>
    );
};

const Logo = () => (
    <motion.a
        href='/'
        className='heading-logo tracking-tighter'
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.35 }}
    >
        <Image
            src='/logo/logo-transparent.jpg'
            alt='Griipbuddy Logo'
            width={100}
            height={50}
            loading='eager'
            className='h-auto w-auto'
        />
    </motion.a>
);

// --- Sub-Component: Megamenu Content ---

interface SubSubCategory {
    _id: string;
    name_en: string;
    slug: string;
}

interface SubCategory {
    _id: string;
    name_en: string;
    slug: string;
    sub_subcategories: SubSubCategory[];
    media: any;
}

const WalletsMenu = ({ subcategories }: { subcategories: SubCategory[] }) => {
    return (
        <div className='grid min-w-[300px] grid-cols-1 gap-8 rounded-[20px] bg-white p-10 shadow-2xl md:min-w-[900px] md:grid-cols-3'>
            {subcategories?.map((sub) => {
                return (
                    <div key={sub._id} className='flex flex-col'>
                        {/* Sub-Category Title: Acts as a header for the column */}
                        <Link href={`/products/${sub.slug}`} className='group'>
                            {/* <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-100 aspect-video">
                <Image
                  src={getMediaUrl(
                    (sub?.media && sub?.media[0]?.image) ||
                      "/public/No_Image_Available.jpg",
                  )}
                  className="rounded-xl object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={sub?.name_en}
                  fill
                />
              </div> */}
                            <h3 className='sm-semibold mb-2 transition-colors group-hover:text-blue-600'>
                                {sub?.name_en}
                            </h3>
                        </Link>

                        {/* Sub-Sub-Categories List */}
                        <ul className='space-y-2 text-sm text-gray-600'>
                            {sub.sub_subcategories?.map((ssub) => {
                                return (
                                    <li key={ssub?._id}>
                                        <Link
                                            href={`/products/${ssub.slug}`}
                                            className='inline-block transition-all duration-200 hover:translate-x-1 hover:text-blue-600'
                                        >
                                            {ssub?.name_en}
                                            {/* Optional: Add logic here to show NEW/HOT badges based on your data if available */}
                                            {ssub?.name_en?.includes(
                                                'Collection'
                                            ) && (
                                                <span className='ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-[12px] text-white'>
                                                    NEW
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}

                            {/* View All link for the sub-category if needed */}
                            {/* <li className="pt-2 border-t border-gray-50 mt-2">
                <Link
                  href={`/products/${sub?.slug}`}
                  className="nav-see-more uppercase tracking-wider hover:underline"
                >
                  Shop All {sub?.name_en}
                </Link>
              </li> */}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};

interface NavLinkProps {
    href: string;
    children?: ReactNode;
    isActive: boolean;
    onMouseEnter: () => void;
    icon?: ReactNode;
    className?: string;
}

export const NavLink = ({
    href,
    children,
    isActive,
    onMouseEnter,
    icon,
    className
}: NavLinkProps) => {
    return (
        <motion.a
            href={href}
            onMouseEnter={onMouseEnter}
            variants={itemNav}
            className='nav-link relative flex h-full cursor-pointer items-center gap-1.5 px-1 transition-colors hover:text-black'
        >
            {/* Render icon if provided */}
            {icon && <span className='text-primary'>{icon}</span>}

            {children && <span className={className}>{children}</span>}

            {/* Framer Motion Underline */}
            {isActive && (
                <motion.div
                    layoutId='navUnderline' // Shared ID makes the line "slide" between links
                    className='absolute right-0 -bottom-[4px] left-0 h-[2px] bg-black'
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                />
            )}
        </motion.a>
    );
};

interface CartButtonProps {
    totalItems: number;
    isMounted: boolean;
    isActive: boolean;
    onMouseEnter: () => void;
}

export const CartButton = ({
    totalItems,
    isMounted,
    isActive,
    onMouseEnter
}: CartButtonProps) => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/cart')}
            onMouseEnter={onMouseEnter}
            className='nav-link group relative flex h-full cursor-pointer items-center gap-1.5 px-1 transition-colors hover:text-black'
            aria-label='View shopping cart'
        >
            <div className='relative'>
                <ShoppingCart className='size-5 text-primary' />

                {/* Notification Badge */}
                {isMounted && totalItems > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='nav-cart absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm'
                    >
                        {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                )}
            </div>

            {/* Animated underline indicator - matching NavLink */}
            {isActive && (
                <motion.div
                    layoutId='navUnderline'
                    className='absolute right-0 -bottom-[4px] left-0 h-[2px] bg-black'
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
        </button>
    );
};
