'use client';

import { Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGetAllCategoriesQuery } from '@/redux/public/api/category-api';

interface EmptyProductsProps {
    categoryName: string;
    type?: 'product' | 'category' | 'default';
}

export function EmptyProducts({
    categoryName,
    type = 'product'
}: EmptyProductsProps) {
    const { data, isLoading, isError } = useGetAllCategoriesQuery({});
    const categoriesData = data?.data?.data ?? [];

    return (
        <div className='py:4 flex min-h-[75vh] items-center justify-center px-4 lg:min-h-[90vh] lg:py-12'>
            <motion.div
                // Visible in the server HTML; this message is often the biggest thing on screen.
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='w-full max-w-2xl space-y-6 text-center'
            >
                {/* Icon Container */}
                <div className='flex justify-center'>
                    <div className='flex h-20 w-20 items-center justify-center rounded-full border border-gray-100 bg-gray-50'>
                        <Search
                            className='h-10 w-10 text-gray-600'
                            strokeWidth={1.5}
                        />
                    </div>
                </div>

                {/* Heading product */}
                {type === 'product' && (
                    <div className='space-y-2'>
                        <h1 className='two-xl-medium'>No products found</h1>
                        <p className='sm-gray'>
                            We couldn&apos;t find any products in{' '}
                            <span className='sm-semibold text-primary-ink capitalize'>
                                {categoryName}
                            </span>
                        </p>
                    </div>
                )}

                {/* Description product*/}
                {type === 'product' && (
                    <p className='sm-gray mx-auto max-w-md'>
                        This category might be empty at the moment, or products
                        may have been moved. Try exploring our other collections
                        below.
                    </p>
                )}

                {/* Heading category */}
                {type === 'category' && (
                    <div className='space-y-2'>
                        <h1 className='two-xl-medium'>
                            No subcategories found
                        </h1>
                        <p className='sm-gray'>
                            No Subcategories found for this{' '}
                            <span className='sm-semibold text-primary-ink capitalize'>
                                {categoryName}
                            </span>{' '}
                            category.
                        </p>
                    </div>
                )}

                {/* Description category*/}
                {type === 'category' && (
                    <p className='sm-gray mx-auto max-w-md'>
                        There are currently no sub-levels defined for this
                        section. Please check back later or browse other
                        categories.
                    </p>
                )}

                {/* Main Action - Back to Home */}
                <div className='flex justify-center lg:pt-4'>
                    <Link
                        href='/'
                        className='group base-semibold flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-primary-foreground transition-all hover:opacity-90'
                    >
                        Back to Home
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </Link>
                </div>

                {/* Category Suggestions */}
                <div className='border-t border-gray-100 lg:pt-10'>
                    <p className='xss-normal text-primary-ink mb-4 tracking-widest uppercase'>
                        Explore Other Categories
                    </p>
                    <div className='flex flex-wrap justify-center gap-3'>
                        {isLoading ? (
                            CategorySkeleton()
                        ) : isError ? (
                            <p className='text-red-500'>
                                Failed to load categories. Please try again.
                            </p>
                        ) : !Array.isArray(categoriesData) ||
                          categoriesData.length === 0 ? (
                            <p className='text-gray-600'>
                                No categories available
                            </p>
                        ) : (
                            (categoriesData || [])?.map((cat: any) => (
                                <Link
                                    key={cat?._id}
                                    href={`/category/${cat?.slug}`}
                                    className='sm-normal hover:text-primary-ink rounded-lg border border-gray-200 px-6 py-2 transition-colors hover:border-primary'
                                >
                                    {cat?.name_en}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function CategorySkeleton() {
    return (
        <div className='flex flex-wrap justify-center gap-3'>
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className='h-10 w-28 animate-pulse rounded-lg border border-gray-100 bg-gray-200'
                />
            ))}
        </div>
    );
}
