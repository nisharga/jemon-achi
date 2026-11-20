'use client';

import React from 'react';
import AddNewFeaturedProduct from './_components/add-new-featured-product';
import FeaturedProducts from './_components/featured-products';
import { useGetAllFeaturedProductsQuery } from '@/admin/redux/api-queries/featured-product-api';

const FeaturedProductsPage = () => {
    // === get featured products ===
    const { data, isLoading, isFetching } = useGetAllFeaturedProductsQuery({});
    const featuredProducts = data?.data?.products;

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-6'>
                <h1 className='text-2xl font-medium'>Featured Products</h1>
            </div>

            <FeaturedProducts featuredProducts={featuredProducts} />

            {/* loading data state */}
            {(isLoading || isFetching) && (
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <span
                            key={index}
                            className='animate-skeleton h-[300px] rounded-md bg-secondary'
                        />
                    ))}
                </div>
            )}

            <AddNewFeaturedProduct
                featuredProductslength={featuredProducts?.length}
            />
        </div>
    );
};

export default FeaturedProductsPage;
