'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Container } from '@/components/public/common/container';
import { getMediaUrl } from '@/lib/get-media-url';
import { useGetCmsHomePageQuery } from '@/redux/public/api/publicApi';

const ProductPage = () => {
    // items
    const { data, isLoading } = useGetCmsHomePageQuery({});
    const bestSelling = data?.data?.best_selling || [];

    if (isLoading) return <BestSellingSkeleton />;

    // Handle empty state
    if (!isLoading && bestSelling.length === 0)
        return (
            <div className='flex min-h-[90vh] items-center justify-center py-20 text-center font-bold'>
                No product found
            </div>
        );
    return (
        <Container className='mx-auto min-h-[calc(100vh-100px)] px-2 py-4 sm:px-6 md:px-10 lg:py-10'>
            {/* Header Bar */}
            <div className='mb-4 flex items-center justify-between lg:mb-8'>
                {/* PC TOGGLE: Only updates showFilter state */}

                <h3 className='two-xl-medium'>{'Best Selling'}</h3>
            </div>

            <div className='flex gap-4 lg:gap-10'>
                {/* Product Grid */}

                <div className='grid flex-1 grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6'>
                    {bestSelling?.map((product: any) => {
                        const id = product?.product_id?.sku;
                        const thumbnail = product?.product_id?.thumbnail;
                        const name = product?.product_id?.name;
                        const slug = product?.product_id?.slug;
                        return (
                            <motion.a
                                layout
                                key={id}
                                className='group block cursor-pointer'
                                href={`/product/${slug}`}
                            >
                                <div className='relative mb-4 overflow-hidden rounded-xl bg-[#F5F5F5]'>
                                    {/*  <button className="absolute top-4 right-4 z-10 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                </button> */}
                                    <Image
                                        width={600}
                                        height={800}
                                        src={getMediaUrl(
                                            product?.media?.[0]?.image ||
                                                thumbnail
                                        )}
                                        alt={name}
                                        className='h-full w-full object-contain transition-transform duration-500 group-hover:scale-110'
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

export default ProductPage;

const BestSellingSkeleton = () => (
    <Container className='py-2 lg:py-8'>
        <div className='mb-6 h-8 w-48 animate-pulse bg-gray-200' />
        <div className='grid grid-cols-2 gap-5 md:grid-cols-3'>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className='aspect-square animate-pulse rounded-lg bg-gray-100'
                />
            ))}
        </div>
    </Container>
);
