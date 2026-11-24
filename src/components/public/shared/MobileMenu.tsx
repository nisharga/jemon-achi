'use client';
import { getMediaUrl } from '@/lib/get-media-url';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/use-user';
import LogoutDialog from '@/components/public/shared/LogoutDialog';

const MobileMenu = ({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    categoriesData
}: any) => {
    // 1. Track levels of navigation
    const [activeCategory, setActiveCategory] = useState<any>(null);
    const [activeSubCategory, setActiveSubCategory] = useState<any>(null);

    const { user, isLoading: isUserLoading, isMounted } = useUser();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
        setActiveCategory(null);
        setActiveSubCategory(null);
    };

    // Handle back button logic based on depth
    const handleBack = () => {
        if (activeSubCategory) {
            setActiveSubCategory(null);
        } else {
            setActiveCategory(null);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ y: '-100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '-100%' }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 200
                            }}
                            className='fixed inset-0 top-4 left-2 z-50 flex h-[85vh] w-[95%] flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl lg:hidden'
                        >
                            {/* --- HEADER SECTION --- */}
                            <div className='mb-8 flex items-center justify-between'>
                                {activeCategory ? (
                                    <div className='flex w-full items-center justify-between'>
                                        <button
                                            onClick={handleBack}
                                            className='-ml-2 rounded-full border border-gray-100 bg-gray-50 p-2 shadow-sm'
                                        >
                                            <ChevronLeft className='h-5 w-5' />
                                        </button>
                                        <span className='base-normal'>
                                            {activeSubCategory
                                                ? activeSubCategory.name_en
                                                : activeCategory.name_en}
                                        </span>
                                        <div className='w-9' />
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            href='/'
                                            className='heading-logo tracking-tighter'
                                            onClick={closeMenu}
                                        >
                                            Griipbuddy
                                        </Link>
                                        <button
                                            onClick={closeMenu}
                                            className='rounded-md p-2 hover:bg-gray-100'
                                        >
                                            <X className='text-primary-ink h-6 w-6' />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* --- CONTENT SECTION --- */}
                            <div className='no-scrollbar flex-1 overflow-y-auto'>
                                <ul className='flex flex-col gap-3'>
                                    {/* LEVEL 1: Main Categories */}
                                    {!activeCategory &&
                                        categoriesData?.map((category: any) => {
                                            if (!category?.is_published)
                                                return null;
                                            const hasSub =
                                                category?.subcategories
                                                    ?.length > 0;
                                            const imageUrl =
                                                category?.media &&
                                                category?.media[0]?.image;
                                            console.log('category', category);
                                            return (
                                                <li key={category?._id}>
                                                    {hasSub ? (
                                                        <button
                                                            onClick={() =>
                                                                setActiveCategory(
                                                                    category
                                                                )
                                                            }
                                                            className='flex w-full items-center justify-between rounded-xl border border-gray-50 bg-white p-3 shadow-sm'
                                                        >
                                                            <div className='flex items-center gap-4'>
                                                                <div className='rounded-lg bg-gray-50 p-1'>
                                                                    <Image
                                                                        src={getMediaUrl(
                                                                            imageUrl ||
                                                                                '/public/No_Image_Available.jpg'
                                                                        )}
                                                                        alt=''
                                                                        width={
                                                                            40
                                                                        }
                                                                        height={
                                                                            40
                                                                        }
                                                                        className='rounded-md object-cover'
                                                                    />
                                                                </div>
                                                                <span className='xs-normal'>
                                                                    {
                                                                        category?.name_en
                                                                    }
                                                                </span>
                                                            </div>
                                                            <ChevronRight className='xs-normal h-5 w-5' />
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={`/category/${category?.slug}`}
                                                            onClick={closeMenu}
                                                            className='flex w-full items-center justify-between rounded-xl border border-gray-50 bg-white p-3'
                                                        >
                                                            <div className='flex items-center gap-4'>
                                                                <div className='rounded-lg bg-gray-50 p-1'>
                                                                    <Image
                                                                        src={getMediaUrl(
                                                                            imageUrl
                                                                        )}
                                                                        alt=''
                                                                        width={
                                                                            40
                                                                        }
                                                                        height={
                                                                            40
                                                                        }
                                                                        className='rounded-md object-cover'
                                                                    />
                                                                </div>
                                                                <span className='xs-normal'>
                                                                    {
                                                                        category?.name_en
                                                                    }
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    )}
                                                </li>
                                            );
                                        })}

                                    {/* LEVEL 2: Sub-categories */}
                                    {activeCategory &&
                                        !activeSubCategory &&
                                        activeCategory.subcategories?.map(
                                            (sub: any) => {
                                                const hasSubSub =
                                                    sub?.sub_subcategories
                                                        ?.length > 0;
                                                const subSubImage =
                                                    sub?.media &&
                                                    sub?.media[0]?.image;
                                                return (
                                                    <li key={sub?._id}>
                                                        {hasSubSub ? (
                                                            <Link
                                                                href={`/products/${sub?.slug}`}
                                                                className='flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm'
                                                                onClick={
                                                                    closeMenu
                                                                }
                                                            >
                                                                <div className='flex items-center gap-4'>
                                                                    <div className='rounded-lg bg-gray-50 p-1'>
                                                                        <Image
                                                                            src={getMediaUrl(
                                                                                subSubImage
                                                                            )}
                                                                            alt=''
                                                                            width={
                                                                                50
                                                                            }
                                                                            height={
                                                                                50
                                                                            }
                                                                            className='rounded-md object-cover'
                                                                        />
                                                                    </div>
                                                                    <span className='xs-normal'>
                                                                        {
                                                                            sub?.name_en
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={`/products/${sub?.slug}`}
                                                                className='flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm'
                                                                onClick={
                                                                    closeMenu
                                                                }
                                                            >
                                                                <div className='flex items-center gap-4'>
                                                                    <div className='rounded-lg bg-gray-50 p-1'>
                                                                        <Image
                                                                            src={getMediaUrl(
                                                                                subSubImage
                                                                            )}
                                                                            alt=''
                                                                            width={
                                                                                50
                                                                            }
                                                                            height={
                                                                                50
                                                                            }
                                                                            className='rounded-md object-cover'
                                                                        />
                                                                    </div>
                                                                    <span className='xs-normal'>
                                                                        {
                                                                            sub?.name_en
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </li>
                                                );
                                            }
                                        )}

                                    {/* LEVEL 3: Sub-sub-categories */}
                                    {/* {activeSubCategory &&
                  activeSubCategory.sub_subcategories?.map((ssub: any) => (
                    <li key={ssub?._id}>
                      <Link
                        href={`/products/${ssub?.slug}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/50"
                        onClick={closeMenu}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-50 p-1 rounded-lg">
                            <Image
                              src={getMediaUrl(ssub?.image)}
                              alt=""
                              width={50}
                              height={50}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <span className="xs-normal">{ssub?.name_en}</span>
                        </div>

                        <ChevronRight className="h-4 w-4 xs-normal" />
                      </Link>
                    </li>
                  ))} */}
                                </ul>
                            </div>

                            {/* --- FOOTER SECTION --- */}
                            {!activeCategory && (
                                <div className='mt-auto border-t border-gray-100 pt-5'>
                                    {/* If user is loading, show a placeholder/skeleton to prevent layout shift */}
                                    {isUserLoading ? (
                                        <div className='h-9 w-full animate-pulse rounded-lg bg-gray-100' />
                                    ) : user ? (
                                        /* --- LOGOUT VIEW (Show when logged in) --- */
                                        <button
                                            onClick={() => {
                                                closeMenu();
                                                setIsLogoutOpen(true);
                                            }}
                                            className='w-full rounded-lg border border-red-100 bg-red-50 py-2 text-center text-xs font-medium text-red-600 transition-colors hover:bg-red-100'
                                        >
                                            Logout of Account
                                        </button>
                                    ) : (
                                        /* --- AUTH VIEW (Show when logged out) --- */
                                        <div className='flex gap-4'>
                                            <Link
                                                href='/login'
                                                onClick={closeMenu}
                                                className='flex-1 rounded-lg bg-primary py-2 text-center text-xs font-normal text-primary-foreground'
                                            >
                                                Login
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                        <div
                            className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden'
                            onClick={closeMenu}
                        />
                    </>
                )}
            </AnimatePresence>
            <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
        </>
    );
};
export default MobileMenu;
