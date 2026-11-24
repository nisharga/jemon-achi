'use client';

import { useEffect, useRef, useState } from 'react';
import ProductTile from '@/components/public/common/ProductTile';
import { useGetRandomProductsInfiniteQuery } from '@/redux/public/api/publicApi';
import type {
    ProductCategory,
    ProductSummary
} from '@/types/public/storefront';
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
 * Pages 2, 3, … of "Explore More Products" (infinite scroll).
 *
 * Nothing is loaded until the customer reaches the bottom of the first page.
 * Only then is <LoadedPages /> rendered, which holds the data hook. That keeps
 * the hook out of the prerendered page (RTK Query reads the clock even for a
 * skipped query, which Next.js does not allow while prerendering).
 */
export default function MoreRandomProducts(props: Props) {
    const [started, setStarted] = useState(false);

    if (!props.hasMoreAfterFirstPage) return null;
    if (!started) return <WhenVisible onVisible={() => setStarted(true)} />;
    return <LoadedPages {...props} />;
}

function LoadedPages({ shownOnServer, categories }: Props) {
    const [page, setPage] = useState(2);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetWasShown, setSheetWasShown] = useState(false);

    const { data, isFetching } = useGetRandomProductsInfiniteQuery({
        page,
        limit: RANDOM_PAGE_SIZE
    });

    // The API merges every loaded page into one list (see publicApi.ts).
    const products: ProductSummary[] = data?.data?.products ?? [];
    const hasMore = page < (data?.meta?.total_pages ?? 0);

    // Index (in this list) of the product that opens the category sheet.
    const sheetIndex = SHOW_CATEGORIES_AFTER - shownOnServer;

    return (
        <>
            {products.map((product, index) => (
                <li key={`${product._id}-${index}`}>
                    {index === sheetIndex && !sheetWasShown && (
                        <WhenVisible
                            as='span'
                            onVisible={() => {
                                setSheetOpen(true);
                                setSheetWasShown(true);
                            }}
                        />
                    )}
                    <ProductTile product={product} sizes={GRID_TILE_SIZES} />
                </li>
            ))}

            {isFetching ? (
                <li className='col-span-full flex h-14 items-center justify-center'>
                    <span className='animate-pulse text-sm text-gray-600'>
                        Loading more items...
                    </span>
                </li>
            ) : (
                hasMore && <WhenVisible onVisible={() => setPage(page + 1)} />
            )}

            <CategorySheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                categories={categories}
            />
        </>
    );
}

/** Invisible marker that calls `onVisible` when it scrolls into view. */
function WhenVisible({
    onVisible,
    as = 'li'
}: {
    onVisible: () => void;
    as?: 'li' | 'span';
}) {
    const ref = useRef<HTMLLIElement & HTMLSpanElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) onVisible();
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [onVisible]);

    if (as === 'span') return <span ref={ref} />;
    return <li ref={ref} className='col-span-full h-14' aria-hidden='true' />;
}
