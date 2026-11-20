'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useGetAllProductsQuery } from '@/shop/redux/api/product-api';
import { searchInputVariants } from '@/shop/types/navbar';
import Image from 'next/image';
import { getMediaUrl } from '@/shop/lib/get-media-url';

export function useDebounce<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// New variants for the dropdown effect
const mobileDropdownVariants = {
    hidden: {
        y: '-100%',
        opacity: 0,
        transition: { type: 'tween', duration: 0.3 }
    },
    visible: {
        y: '0%',
        opacity: 1,
        transition: { type: 'tween', duration: 0.3 }
    },
    exit: {
        y: '-100%',
        opacity: 0,
        transition: { type: 'tween', duration: 0.2 }
    }
};

const SearchRecommendationSkeleton = () => (
    // Updated skeleton gradient class to use standard Tailwind classes
    <div className='space-y-3'>
        {Array?.from({ length: 5 }).map(
            (
                _,
                i // Max 5 items for skeleton
            ) => (
                <div
                    key={`skeleton-${i}`}
                    className='flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3'
                >
                    <div className='h-12 w-12 animate-pulse rounded-lg bg-gray-300'></div>
                    <div className='flex-1 space-y-2'>
                        <div className='h-4 w-4/5 animate-pulse rounded-full bg-gray-300'></div>
                        <div className='h-3 w-1/2 animate-pulse rounded-full bg-gray-200'></div>
                    </div>
                </div>
            )
        )}
    </div>
);

interface MobileSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileSearch = ({ isOpen, onClose }: MobileSearchOverlayProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 400); // here get main value

    const shouldSearch = debouncedSearchTerm.trim().length > 0;

    const { data: product, isFetching: isLoadingRecommendations } =
        useGetAllProductsQuery(
            { searchTerm: debouncedSearchTerm },
            { skip: !shouldSearch }
        );

    // ================= fetching ====================
    const filteredRecommendations = product?.data?.products;

    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        // NOTE: For the new dropdown design, we typically remove the outside click handler
        // as the user should still be able to interact with the page below the dropdown.
        // However, if you want the dropdown to close when clicking the page body, keep this.
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscapeKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 200);
        }
    }, [isOpen]);

    const handleSearchSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && searchTerm.length > 0) {
            event.preventDefault();
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    // 👇 NEW DROPDOWN CLASSES AND VARIANTS
                    variants={mobileDropdownVariants as any}
                    // Fixed positioning right under assumed header (e.g., 4rem/64px), full width, max height
                    className='fixed top-[92px] right-0 left-0 z-60 max-h-[75vh] overflow-hidden border-t border-gray-200 bg-white shadow-xl md:hidden'
                    ref={searchRef}
                >
                    {/* Header/Close Button within the dropdown panel */}
                    <div className='flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-primary/5 to-secondary/5 px-2'>
                        {/* Search Input */}
                        <motion.div
                            variants={searchInputVariants as any}
                            initial='hidden'
                            animate='visible'
                            className='w-full border-b border-gray-100 py-2 pr-4'
                        >
                            <div className='relative'>
                                <Search className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-900' />
                                <input
                                    ref={searchInputRef}
                                    type='text'
                                    placeholder='What are you looking for?'
                                    className='sm-normal w-full rounded-2xl border-2 border-gray-200 bg-gray-50 py-2 pr-6 pl-12 transition-all duration-300 placeholder:text-xs placeholder:text-gray-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 focus:outline-none'
                                    value={searchTerm}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearchSubmit}
                                />
                                {searchTerm && (
                                    <motion.button
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSearchTerm('')}
                                        className='absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-200'
                                    >
                                        <X className='h-4 w-4 text-gray-500' />
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className='rounded-full bg-primary p-2 transition-colors hover:bg-gray-100'
                            aria-label='Close search'
                        >
                            <X className='h-5 w-5 text-white' />
                        </motion.button>
                    </div>

                    {/* Results/Recommendations Container - SCROLLABLE CONTENT */}
                    <div
                        className='overflow-y-auto p-2'
                        style={{ maxHeight: 'calc(75vh - 120px)' }}
                    >
                        {/* Calculate max height for scroll */}
                        {searchTerm.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className='xs-normal py-2 text-center'
                            >
                                Start typing to see product recommendations.
                            </motion.div>
                        ) : (
                            /* Search Results */
                            <div>
                                {isLoadingRecommendations ? (
                                    <div className='space-y-4'>
                                        <div className='mb-4 flex items-center gap-2'>
                                            <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                                            <span className='text-gray-600'>
                                                Searching...
                                            </span>
                                        </div>
                                        <SearchRecommendationSkeleton />
                                    </div>
                                ) : filteredRecommendations?.length > 0 ? (
                                    <div>
                                        <div className='space-y-3'>
                                            {/* LIMIT TO MAX 5 PRODUCTS VISIBLE AT ONCE */}
                                            {filteredRecommendations
                                                .slice(0, 3)
                                                .map((item: any) => (
                                                    <div key={item._id}>
                                                        <Link
                                                            href={`/product/${item?.slug}`}
                                                            className='group flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-2 transition-all duration-300 hover:border-primary/30 hover:shadow-lg'
                                                            onClick={() => {
                                                                setSearchTerm(
                                                                    item.name
                                                                );
                                                                onClose();
                                                            }}
                                                        >
                                                            <div className='relative'>
                                                                <Image
                                                                    src={getMediaUrl(
                                                                        item?.thumbnail
                                                                    )}
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    width={80}
                                                                    height={80}
                                                                    className='max-h-16 w-auto rounded-xl object-cover transition-transform duration-300 group-hover:scale-105'
                                                                />
                                                                {/*  {item?.discountPercentage > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  -{item?.discountPercentage}%
                                </div>
                              )} */}
                                                            </div>
                                                            <div className='min-w-0 flex-1'>
                                                                <h4 className='sm-semibold line-clamp-2 transition-colors group-hover:text-primary'>
                                                                    {item.name}
                                                                </h4>
                                                                {/*  <div className="flex items-center gap-2">
                                {item.variants[0].sale_price > 0 ? (
                                  <>
                                    <span className="text-base font-bold text-red-500">
                                      ৳ {item.variants[0].sale_price}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      {item.variants[0].regular_price}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">
                                    {item.variants[0].sale_price}
                                  </span>
                                )}
                              </div> */}
                                                            </div>
                                                            <ChevronDown className='h-5 w-5 -rotate-90 text-gray-900 transition-colors group-hover:text-primary' />
                                                        </Link>
                                                    </div>
                                                ))}

                                            {/* Optional: View All Link */}
                                            {/* {filteredRecommendations.length > 5 && (
                        <div className="text-center pt-2">
                          <Link
                            href={`/search?q=${encodeURIComponent(searchTerm)}`}
                            className="base-semibold hover:text-primary/80 transition-colors"
                            onClick={onClose}
                          >
                            View all {filteredRecommendations.length} results
                          </Link>
                        </div>
                      )} */}
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className='py-12 text-center'
                                    >
                                        <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                                            <Search className='h-8 w-8 text-gray-400' />
                                        </div>
                                        <h3 className='mb-2 text-lg font-semibold text-gray-800'>
                                            No results found
                                        </h3>
                                        <p className='mb-4 text-gray-600'>
                                            Try searching with different
                                            keywords
                                        </p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className='rounded-full bg-primary px-6 py-2 text-white transition-colors hover:bg-primary/90'
                                        >
                                            Clear Search
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileSearch;
