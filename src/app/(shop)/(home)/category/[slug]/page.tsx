'use client';
import React from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { useGetAllSubCategoryByCategorySlugQuery } from '@/shop/redux/api/category-api';
import { EmptyProducts } from '../../products/[slug]/_components/EmptyProduct';

export interface IProps {
    _id: number;
    image: string;
    title: string;
    name_en: string;
    slug: string;
    media: any;
}

const SubCategoryGrid = () => {
    const params = useParams();
    // Extract name safely (params.name could be a string or string[])
    const slug = Array.isArray(params?.slug)
        ? params.slug[0]
        : params.slug || '';

    const { data, isLoading, isError } =
        useGetAllSubCategoryByCategorySlugQuery({
            slug
        });
    const subCategories = data?.data ?? [];

    return (
        <section className='mx-auto min-h-[100vh] max-w-7xl px-4 py-4 sm:py-12'>
            {subCategories?.length !== 0 && (
                <h2 className='mb-4 text-center text-xl font-medium tracking-widest uppercase sm:mb-12 md:text-2xl'>
                    {slug}
                </h2>
            )}

            {isLoading ? (
                <SubCategorySkeleton />
            ) : subCategories?.length === 0 || isError ? (
                <EmptyProducts categoryName={slug} type='category' />
            ) : (
                <div className='grid grid-cols-2 gap-x-2 gap-y-2 sm:gap-x-4 sm:gap-y-12 lg:grid-cols-6'>
                    {subCategories?.map((sub: IProps) => {
                        return (
                            <motion.a
                                href={`/products/${sub?.slug}`}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.35 }}
                                key={sub._id}
                                className='group flex cursor-pointer snap-center flex-col items-center'
                            >
                                {/* Circular Image Container */}
                                <div className='relative mb-4 overflow-hidden rounded-t-lg bg-[#F5F5F5] transition-transform duration-300 group-hover:scale-105'>
                                    <Image
                                        src={getMediaUrl(
                                            sub?.media?.[0]?.image
                                        )}
                                        alt={sub?.name_en}
                                        width={500}
                                        height={500}
                                        className='h-full w-full object-contain'
                                    />
                                </div>

                                {/* Title */}
                                <h3 className='px-2 text-center text-[11px] font-bold tracking-wider uppercase transition-colors group-hover:text-neutral-600 md:text-sm'>
                                    {sub?.name_en}
                                </h3>
                            </motion.a>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default SubCategoryGrid;

const SubCategorySkeleton = () => {
    return (
        <div className='mx-auto max-w-7xl px-4 py-10 text-center'>
            <div className='mx-auto mb-10 h-6 w-48 animate-pulse rounded bg-gray-200' />
            <div className='no-scrollbar flex gap-x-6 gap-y-10 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-4'>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                        key={i}
                        className='flex min-w-[140px] flex-col items-center space-y-4'
                    >
                        <div className='h-32 w-32 animate-pulse rounded-full bg-gray-100 md:h-40 md:w-40' />
                        <div className='h-4 w-24 animate-pulse rounded bg-gray-100' />
                    </div>
                ))}
            </div>
        </div>
    );
};
