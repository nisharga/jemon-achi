'use client';

import { Container } from '@/components/public/common/container';
import ProductCard from '@/components/public/common/product-card';
import ProductCardSkeleton from '@/components/public/home/sections/ProductCardSkeleton';
import { useGetProductsByCategoryQuery } from '@/redux/public/api/category-api';
import { skipToken } from '@reduxjs/toolkit/query';

interface RelatedProductsProps {
    // category id read from the product details (`product.category._id`)
    categoryId?: string;
    // current product id, used to exclude it from the related list
    currentProductId?: string;
}

export default function RelatedProducts({
    categoryId,
    currentProductId
}: RelatedProductsProps) {
    const { data, isLoading } = useGetProductsByCategoryQuery({
        categoryId: categoryId ?? skipToken,
        page: 1,
        limit: 30
    });

    // Exclude the product currently being viewed
    const products = (data?.data?.data ?? []).filter(
        (product: any) => product?._id !== currentProductId
    );

    // Nothing to show (and not loading) -> render nothing
    if (!categoryId || (!isLoading && products.length === 0)) return null;

    return (
        <Container className='py-4 sm:py-8'>
            <div className='mb-6'>
                <h2 className='text-xl font-medium tracking-tight text-gray-900 sm:text-2xl'>
                    Related Products
                </h2>
            </div>

            <div className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, idx) => (
                          <ProductCardSkeleton key={idx} />
                      ))
                    : products.map((product: any) => (
                          <ProductCard key={product?._id} product={product} />
                      ))}
            </div>
        </Container>
    );
}
