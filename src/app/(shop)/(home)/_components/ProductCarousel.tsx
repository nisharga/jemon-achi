'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useGetAllProductsQuery } from '@/shop/redux/api/product-api';
import { Container } from '@/shop/components/common/container';

import { ProductCardSkeleton } from '@/shop/components/skeleton';
import dynamic from 'next/dynamic';
import { useGetProductsByCategoryQuery } from '@/shop/redux/api/category-api';

const ProductCard = dynamic(
    () => import('@/shop/components/common/product-card'),
    {
        loading: () => <div className='h-64 animate-pulse bg-gray-100' />
    }
);

type ProductCarouselProps = {
    category: any;
};

export default function ProductCarousel({ category }: ProductCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 }
        }
    });

    const { data, isLoading, isError } = useGetProductsByCategoryQuery({
        categoryId: category._id
    });

    const productData = data?.data?.data ?? [];

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback((emblaApi: any) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    const handleAddToCart = (productId: string) => {
        console.log(`Added product ${productId} to cart`);
    };

    if (isError) {
        return null;
    }

    // ====================== fetching data ========================
    const categoryName = category?.name_en || '';
    const categoryId = category?.slug || ''; //slug
    return (
        <Container className='relative px-0 pb-4 sm:px-2 lg:px-4'>
            {/* Navigation Controls (Prev/Next/Dots) */}

            <button
                aria-label='back'
                onClick={scrollPrev}
                className='absolute top-1/2 left-0 z-1 -translate-y-1/2 cursor-pointer rounded-full border bg-white/60 p-1 backdrop-blur-sm transition-all duration-200 hover:bg-white sm:p-2'
            >
                <ChevronLeft className='size-4 text-slate-700 md:size-6' />
            </button>
            <button
                aria-label='next'
                onClick={scrollNext}
                className='absolute top-1/2 right-0 z-1 -translate-y-1/2 cursor-pointer rounded-full border bg-white/80 p-1 backdrop-blur-sm transition-all duration-200 hover:bg-white sm:p-2'
            >
                <ChevronRight className='size-4 text-slate-700 md:size-6' />
            </button>
            {/* End Navigation Controls (Prev/Next/Dots) */}

            <div className='mb-2 flex items-center justify-between px-2 sm:mb-4 sm:px-0'>
                <div className='flex w-full items-center justify-between'>
                    <h3 className='text-base text-[18px] font-medium tracking-wide text-secondary uppercase md:text-xl'>
                        {categoryName}
                    </h3>

                    <Link
                        className='inline-flex items-center gap-2 text-xs'
                        href={`/category/${categoryId}`}
                        aria-label='View all products cursor-pointer'
                    >
                        <button
                            data-slot='button'
                            className="flex-center-center lg [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 [&amp;_svg]:shrink-0 has-[&gt;svg]:px-2.5 flex shrink-0 cursor-pointer items-center justify-center gap-0 rounded border border-primary bg-[#E9CCAE]/10 p-1 text-xs font-medium whitespace-nowrap text-secondary uppercase shadow-xs transition-all outline-none hover:bg-secondary/90 hover:text-white focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:p-2 md:h-9 dark:aria-invalid:ring-destructive/40"
                        >
                            See More
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-chevron-right size-3'
                                aria-hidden='true'
                            >
                                <path d='m9 18 6-6-6-6'></path>
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>

            <div className='embla overflow-hidden px-2 sm:px-0' ref={emblaRef}>
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
                            <p className='text-gray-500'>No products shown</p>
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
    );
}
