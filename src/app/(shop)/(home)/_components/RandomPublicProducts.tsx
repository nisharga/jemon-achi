'use client';
import { useMounted } from '@/hooks/useMounted';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Container } from '@/shop/components/common/container';
import SectionTitle from '@/shop/components/global/SectionTitle';
import { useGetRandomProductsInfiniteQuery } from '@/shop/redux/api/publicApi';
import { motion } from 'framer-motion';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import PriceContainer from '@/shop/components/common/PriceContainer';
import CategorySheet from './CategorySheet';

// Auto-open the category sheet once the user scrolls past this many products
const AUTO_OPEN_AFTER = 30;

interface IProps {
    _id: number | string;
    image: string;
    name: string;
    slug: string;
    thumbnail: string;
    media: any;
    variants: {
        regular_price: number;
        sale_price: number;
    }[];
}

const RandomPublicProducts = () => {
    const [page, setPage] = useState(1);
    const observerRef = useRef<HTMLDivElement | null>(null);

    // Category catcher bottom sheet
    const [sheetOpen, setSheetOpen] = useState(false);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);
    const triggerRef = useRef<HTMLAnchorElement | null>(null);
    // Same skeleton on the server and the hydration render, even if the
    // query is already cached on the client (e.g. fetched by the Navbar).
    const mounted = useMounted();

    const { data, isLoading, isFetching } = useGetRandomProductsInfiniteQuery({
        page,
        limit: 20
    });

    const products = data?.data?.products || [];

    const hasMore = data?.meta?.total_pages
        ? page < data.meta.total_pages
        : products.length > 0;

    useEffect(() => {
        if (isLoading || isFetching || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [isLoading, isFetching, hasMore]);

    // Auto-open the category sheet once, when the user scrolls past the Nth product
    useEffect(() => {
        if (hasAutoOpened) return;
        const el = triggerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setSheetOpen(true);
                    setHasAutoOpened(true);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [products.length, hasAutoOpened]);

    if (!mounted || (isLoading && page === 1)) return <Skeleton />;

    return (
        <Container className='group relative py-2 sm:py-8'>
            <div className='mb-2 flex items-center justify-between sm:mb-4'>
                <SectionTitle title='Explore More Products' />
            </div>

            {/* Grid wrapper supporting your requested layout responsiveness */}
            <div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-5'>
                {/* Added index parameter here */}
                {(products ?? [])?.map((item: IProps, index: number) => {
                    const id = item?._id || '';
                    const thumbnail = item?.thumbnail;
                    const title = item?.name || '';
                    const url = `/product/${item?.slug}`;

                    const oldPrice = item?.variants[0]?.regular_price;
                    const newPrice = item?.variants[0]?.sale_price;

                    return (
                        <motion.a
                            // FIX: Combined ID + index ensures React uniquely maps every appended item page
                            key={`${id}-${index}`}
                            ref={
                                index === AUTO_OPEN_AFTER - 1
                                    ? triggerRef
                                    : undefined
                            }
                            initial={{ opacity: 0, scale: 0.7 }}
                            whileInView={{
                                opacity: 1,
                                scale: 1
                            }}
                            transition={{
                                duration: 0.6,
                                delay: 0.1,
                                ease: 'easeOut'
                            }}
                            viewport={{ once: false, amount: 0.2 }}
                            href={url}
                            className='group/item block'
                        >
                            {/* Image Wrapper */}
                            <div className='relative mb-2 aspect-square overflow-hidden rounded-t-sm bg-[#F3F3F3] lg:mb-4'>
                                <Image
                                    src={getMediaUrl(thumbnail)}
                                    alt={title}
                                    fill
                                    sizes='(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw'
                                    className='object-contain transition-transform duration-500 group-hover/item:scale-105'
                                />
                            </div>

                            {/* Details Wrapper */}
                            <div className='mb-1'>
                                <h3 className='lg-medium line-clamp-1 font-medium text-gray-800'>
                                    {title}
                                </h3>

                                {/* Price Container */}
                                <PriceContainer
                                    newPrice={newPrice}
                                    oldPrice={oldPrice}
                                />
                            </div>
                        </motion.a>
                    );
                })}
            </div>

            {/* Infinite Scroll Trigger Anchor */}
            <div
                ref={observerRef}
                className='mt-4 flex h-14 w-full items-center justify-center'
            >
                {isFetching && (
                    <div className='animate-pulse text-sm text-gray-400'>
                        Loading more items...
                    </div>
                )}
            </div>

            {/* Category catcher bottom sheet */}
            <CategorySheet open={sheetOpen} onOpenChange={setSheetOpen} />
        </Container>
    );
};

const Skeleton = () => (
    <Container className='py-2 lg:py-8'>
        <div className='mb-6 h-8 w-48 animate-pulse bg-gray-200' />
        <div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-5'>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                    key={i}
                    className='aspect-square animate-pulse rounded-sm bg-gray-100'
                />
            ))}
        </div>
    </Container>
);

export default RandomPublicProducts;
