'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react'; // Added X for closing
import { useRouter } from 'next/navigation';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useGetAllProductsQuery } from '@/shop/redux/api/product-api';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { useDebounce } from './MobileSearch';

/* --- Keep useDebounce and SearchRecommendationSkeleton as they were --- */

const DesktopSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false); // Controls the search bar
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls the results

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const shouldSearch = debouncedSearchTerm.trim().length > 0;

    const { data: product, isFetching } = useGetAllProductsQuery(
        { searchTerm: debouncedSearchTerm },
        { skip: !shouldSearch }
    );

    const data = product?.data?.products || [];
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close everything on outside click or ESC
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(e.target as Node)
            ) {
                setIsInputVisible(false);
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
            setIsInputVisible(false);
        }
    };

    return (
        <div
            ref={searchRef}
            className='relative hidden items-center justify-end md:flex'
        >
            {/* --- 1. The Icon Trigger --- */}
            <button
                onClick={() => setIsInputVisible(!isInputVisible)}
                className='rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100'
            >
                {isInputVisible ? (
                    <X className='h-6 w-6' />
                ) : (
                    <Search className='h-6 w-6' />
                )}
            </button>

            {/* --- 2. The Sliding Search Bar (Appears on Bottom) --- */}
            <AnimatePresence>
                {isInputVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className='absolute top-full right-0 z-[60] mt-3 w-[350px]'
                    >
                        <div className='relative overflow-hidden rounded-2xl border border-gray-200 shadow-2xl'>
                            <input
                                autoFocus
                                type='text'
                                placeholder='Search products...'
                                className='w-full bg-white py-4 pr-5 pl-12 text-gray-900 placeholder:text-gray-400 focus:outline-none'
                                value={searchTerm}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                ) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onKeyDown={handleSubmit}
                            />
                            <Search className='absolute top-[27px] left-4 h-5 w-5 -translate-y-1/2 text-gray-400' />

                            {/* --- 3. The Results (Nested inside the search bar container) --- */}
                            <div className='border-t border-gray-100 bg-white'>
                                {!shouldSearch ? (
                                    <div className='p-4 text-center text-sm text-gray-500'>
                                        Type to see recommendations
                                    </div>
                                ) : isFetching ? (
                                    <SearchRecommendationSkeleton />
                                ) : data.length > 0 ? (
                                    <div className='max-h-80 overflow-y-auto'>
                                        {data.slice(0, 5).map((item: any) => (
                                            <Link
                                                key={item._id}
                                                href={`/product/${item?.slug}`}
                                                className='flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50'
                                                onClick={() => {
                                                    setIsInputVisible(false);
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <Image
                                                    src={getMediaUrl(
                                                        item?.thumbnail
                                                    )}
                                                    alt={item?.name}
                                                    width={40}
                                                    height={40}
                                                    className='rounded object-cover'
                                                />
                                                <p className='line-clamp-1 text-sm font-medium text-gray-800'>
                                                    {item?.name}
                                                </p>
                                            </Link>
                                        ))}
                                        <Link
                                            href={`/search?q=${encodeURIComponent(searchTerm)}`}
                                            className='block bg-gray-50 py-3 text-center text-sm font-semibold text-primary hover:bg-gray-100'
                                            onClick={() =>
                                                setIsInputVisible(false)
                                            }
                                        >
                                            View All Results
                                        </Link>
                                    </div>
                                ) : (
                                    <div className='p-6 text-center text-sm text-gray-500'>
                                        No products found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DesktopSearch;

const SearchRecommendationSkeleton = () => (
    <div className='space-y-2 p-2'>
        {Array.from({ length: 5 }).map((_, i) => (
            <div
                key={i}
                className='flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 p-3'
            >
                {/* Image Placeholder */}
                <div className='h-11 w-11 rounded-md bg-gray-200' />

                <div className='flex-1 space-y-2'>
                    {/* Title Placeholder */}
                    <div className='h-3 w-3/4 rounded bg-gray-200' />
                    {/* Subtitle/Price Placeholder */}
                    <div className='h-2 w-1/2 rounded bg-gray-100' />
                </div>
            </div>
        ))}
    </div>
);
