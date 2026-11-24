'use client';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetAllProductsQuery } from '@/shop/redux/api/product-api';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { Container } from '@/shop/components/common/container';

interface IProps {
    name: string;
    slug: string;
    id: number;
    variants: {
        images: string[];
    }[];
}

const SearchPage = () => {
    const params = useParams();
    // Extract name safely (params.name could be a string or string[])
    const searchParams = useSearchParams();
    const slug = searchParams.get('q');

    // const debouncedSearchTerm: any = useDebounce(slug, 100);
    // const shouldSearch = debouncedSearchTerm?.trim().length > 0;
    const { data, isFetching, isLoading, isError } = useGetAllProductsQuery({
        searchTerm: slug,
        limit: 100
    });
    const products = data?.data?.products || [];

    if (isLoading || isFetching || isLoading) return <ProductSkeleton />;
    if (isError || products?.length === 0)
        return (
            <div className='py-20 text-center font-bold'>No product found</div>
        );

    return (
        <Container className='mx-auto min-h-[calc(100vh-100px)] px-2 py-4 sm:px-6 md:px-10 lg:py-10'>
            <h2 className='mt-2 mb-4 text-left text-lg font-medium sm:mt-0 sm:mb-12 md:text-xl'>
                <span className='text-gray-600'>Search Result For:</span> {slug}
            </h2>

            <div className='flex gap-4 lg:gap-10'>
                {/* Product Grid */}
                <div className='grid flex-1 grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6'>
                    {products?.map((product: IProps) => {
                        const name = product?.name || '';
                        const slug = product?.slug || '';
                        const image = product?.variants?.[0]?.images?.[0] || '';
                        return (
                            <motion.a
                                key={product.id}
                                className='group block cursor-pointer'
                                href={`/product/${slug}`}
                            >
                                <div className='relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-[#F5F5F5]'>
                                    {/* Fixed 3:4 box, so the grid does not jump when pictures arrive. */}
                                    <Image
                                        fill
                                        sizes='(min-width: 1024px) 25vw, 50vw'
                                        src={getMediaUrl(image)}
                                        alt={name}
                                        className='object-contain transition-transform duration-500 group-hover:scale-110'
                                    />
                                </div>
                                <h3 className='mb-1 text-xs leading-snug font-bold tracking-tight uppercase md:text-sm'>
                                    {name}
                                </h3>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </Container>
    );
};

export default SearchPage;

const ProductSkeleton = () => (
    <div className='mx-auto grid max-w-[1400px] grid-cols-4 gap-6 px-10 py-10'>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className='space-y-4'>
                <div className='aspect-[3/4] animate-pulse rounded-xl bg-gray-100' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-gray-100' />
                <div className='h-4 w-1/4 animate-pulse rounded bg-gray-100' />
            </div>
        ))}
    </div>
);
