'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { useGetAllProductsQuery } from '@/shop/redux/api/product-api';

type Product = { _id: string; name: string; slug: string; thumbnail?: string };

type Props = {
    /** What the visitor typed (already debounced, never empty). */
    term: string;
    /** How many products to show before "View all results". */
    limit: number;
    /** Called when a result is chosen, e.g. to close the search box. */
    onPick: () => void;
};

/**
 * Product suggestions for a search term.
 *
 * Only rendered once there is something to search for. That keeps the data
 * hook out of the page's first render (Next.js prerenders it, and RTK Query
 * reads the clock even for a skipped query).
 */
export default function SearchResults({ term, limit, onPick }: Props) {
    const { data, isFetching } = useGetAllProductsQuery({ searchTerm: term });
    const products: Product[] = data?.data?.products ?? [];

    if (isFetching) return <ResultsSkeleton rows={limit} />;

    if (products.length === 0) {
        return (
            <p className='p-6 text-center text-sm text-gray-600'>
                No products found for “{term}”.
            </p>
        );
    }

    return (
        <ul className='max-h-80 overflow-y-auto'>
            {products.slice(0, limit).map((product) => (
                <li key={product._id}>
                    <Link
                        href={`/product/${product.slug}`}
                        onClick={onPick}
                        className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
                    >
                        <Image
                            src={getMediaUrl(product.thumbnail)}
                            alt=''
                            width={40}
                            height={40}
                            className='size-10 rounded object-cover'
                        />
                        <span className='line-clamp-1 text-sm font-medium text-gray-800'>
                            {product.name}
                        </span>
                    </Link>
                </li>
            ))}
            <li>
                <Link
                    href={`/search?q=${encodeURIComponent(term)}`}
                    onClick={onPick}
                    className='text-primary-ink block bg-gray-50 py-3 text-center text-sm font-semibold hover:bg-gray-100'
                >
                    View all results
                </Link>
            </li>
        </ul>
    );
}

function ResultsSkeleton({ rows }: { rows: number }) {
    return (
        <div className='space-y-2 p-2' aria-label='Searching…'>
            {Array.from({ length: rows }, (_, index) => (
                <div
                    key={index}
                    className='flex animate-pulse items-center gap-3 p-2'
                >
                    <div className='size-10 rounded bg-gray-200' />
                    <div className='h-3 flex-1 rounded bg-gray-200' />
                </div>
            ))}
        </div>
    );
}
