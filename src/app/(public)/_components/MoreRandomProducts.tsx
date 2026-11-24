'use client';

import { useEffect, useRef, useState } from 'react';
import ProductTile from '@/shop/components/common/ProductTile';
import { useGetRandomProductsInfiniteQuery } from '@/shop/redux/api/publicApi';
import type { ProductCategory, ProductSummary } from '@/shop/types/storefront';
import { GRID_TILE_SIZES, RANDOM_PAGE_SIZE } from '../_lib/constants';
import CategorySheet from './CategorySheet';

/** After this many products, suggest browsing by category (once). */
const SHOW_CATEGORIES_AFTER = 30;

type Props = {
    hasMoreAfterFirstPage: boolean;
    shownOnServer: number;
    categories: ProductCategory[];
};

/**
 * Pages 2, 3, … of "Explore More Products". Each time the customer reaches the
 * bottom of the grid, the next page is loaded and added (infinite scroll).
 */
export default function MoreRandomProducts({
    hasMoreAfterFirstPage,
    shownOnServer,
    categories
}: Props) {
    // Page 1 came with the HTML; this is the last page loaded here.
    const [page, setPage] = useState(1);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetWasShown, setSheetWasShown] = useState(false);

    const { data, isFetching } = useGetRandomProductsInfiniteQuery(
        { page, limit: RANDOM_PAGE_SIZE },
        { skip: page === 1 }
    );

    // The API merges every loaded page into one list (see publicApi.ts).
    const moreProducts: ProductSummary[] = data?.data?.products ?? [];
    const totalPages: number | undefined = data?.meta?.total_pages;
    const hasMore =
        page === 1 ? hasMoreAfterFirstPage : page < (totalPages ?? 0);

    // Load the next page when the bottom of the grid comes into view.
    const bottomRef = useRef<HTMLLIElement>(null);
    useEffect(() => {
        const bottom = bottomRef.current;
        if (!bottom || !hasMore || isFetching) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setPage((current) => current + 1);
        });
        observer.observe(bottom);
        return () => observer.disconnect();
    }, [hasMore, isFetching]);

    // Open the category sheet once, when the customer scrolls past product N.
    const sheetTriggerRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const trigger = sheetTriggerRef.current;
        if (!trigger || sheetWasShown) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setSheetOpen(true);
                setSheetWasShown(true);
            }
        });
        observer.observe(trigger);
        return () => observer.disconnect();
    }, [moreProducts.length, sheetWasShown]);

    const triggerIndex = SHOW_CATEGORIES_AFTER - shownOnServer;

    return (
        <>
            {moreProducts.map((product, index) => (
                <li key={`${product._id}-${index}`}>
                    {index === triggerIndex && <span ref={sheetTriggerRef} />}
                    <ProductTile product={product} sizes={GRID_TILE_SIZES} />
                </li>
            ))}

            {/* Reaching this line loads the next page. */}
            <li
                ref={bottomRef}
                className='col-span-full flex h-14 items-center justify-center'
            >
                {isFetching && (
                    <span className='animate-pulse text-sm text-gray-600'>
                        Loading more items...
                    </span>
                )}
            </li>

            <CategorySheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                categories={categories}
            />
        </>
    );
}
