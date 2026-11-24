'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';
import FilterHeader from './FilterHeader';
import { useGetAllSubCategoriesByCategoryIdQuery } from '@/redux/public/api/subcategory-api';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetAllProductsByIdsQuery } from '@/redux/public/api/product-api';
import { Container } from '@/components/public/common/container';
import { ProductCardSkeleton } from '@/components/public/skeleton';
import ProductCard from '@/components/public/common/product-card';

interface ViewCategoryLayoutProps {
    children: React.ReactNode;
}

const ViewCategoryLayout: React.FC<ViewCategoryLayoutProps> = ({
    children
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // RTK Query now reacts to search and sort changes automatically
    const params = useParams();

    // Use 'name' because your folder is [name]
    const routeValue = params.name as string;

    const [productIds, setProductIds] = useState<string>('');

    useEffect(() => {
        if (routeValue) {
            // decodeURIComponent handles the URL if the browser encoded the "=" sign
            const decoded = decodeURIComponent(routeValue);

            if (decoded.includes('ids=')) {
                const extracted = decoded.split('ids=')[1];
                setProductIds(extracted);
            }
        }
    }, [routeValue]);

    // The query automatically skips if idsString is empty
    const {
        data,
        isLoading,
        error: isError
    } = useGetAllProductsByIdsQuery(productIds, {
        skip: !productIds
    });

    const productData = data?.data || [];
    console.log('productData: ', data);

    const handleAddToCart = (productId: string) => {
        console.log(`Added product ${productId} to cart`);
    };

    return (
        <div className='bg-grey-50 relative z-0 min-h-screen border'>
            {/* Header */}
            <FilterHeader
                totalItems={data?.data?.length || 0}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onSearch={setSearchQuery}
                onMobileFilterOpen={() => setIsMobileFilterOpen(true)}
            />

            {/* products */}
            <Container className='relative px-0 pb-4 sm:px-2 lg:px-4'>
                {/* Navigation Controls (Prev/Next/Dots) */}

                <div className='embla overflow-hidden'>
                    <div className='embla__container flex px-1 sm:px-0'>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className='embla__slide w-1/2 flex-none first:pl-0 sm:pl-2 md:w-1/3 lg:w-1/4 xl:w-1/5'
                                >
                                    <ProductCardSkeleton />
                                </div>
                            ))
                        ) : isError ? (
                            // 2. Error State (Separate from Empty State for better UX)
                            <div className='w-full py-10 text-center'>
                                <p className='text-red-500'>
                                    Failed to load products. Please try again.
                                </p>
                            </div>
                        ) : !Array.isArray(productData) ||
                          productData.length === 0 ? (
                            // 3. Empty State (Includes a check to ensure it's an array)
                            <div className='w-full py-10 text-center'>
                                <p className='text-gray-600'>
                                    No products shown
                                </p>
                            </div>
                        ) : (
                            productData.map((product) => (
                                <div
                                    key={product._id}
                                    className={`embla__slide pl w-1/2 flex-none pl-2 first:pl-0 md:w-1/4 lg:w-1/5 xl:w-1/6`}
                                >
                                    <div className='pr-0'>
                                        <ProductCard
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ViewCategoryLayout;
