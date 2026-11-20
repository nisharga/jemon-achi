'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/shop/components/common/container';
import SectionTitle from '@/shop/components/global/SectionTitle';
import SectionLink from '@/shop/components/global/SectionLink';
import {
    useGetAllCategoriesQuery,
    useGetProductsByCategoryQuery
} from '@/shop/redux/api/category-api';
import { motion } from 'framer-motion';
// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isDesktop } from '@/shop/lib/utils';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import PriceContainer from '@/shop/components/common/PriceContainer';

interface ISubCategory {
    _id: number | string;
    name_en: string;
    slug: string;
}

interface ICategory {
    _id: number;
    name_en: string;
    slug: string;
    status?: string;
    is_active?: boolean;
    is_published?: boolean;
    is_deleted?: boolean;
    subcategories?: ISubCategory[];
}

// Statuses that mean a category should NOT be shown publicly
const HIDDEN_CATEGORY_STATUSES = ['disabled', 'rejected', 'pending_approval'];

interface IProduct {
    _id: number | string;
    name: string;
    slug: string;
    thumbnail: string;
    variants: {
        regular_price: number;
        sale_price: number;
    }[];
}

const CategoryProducts = () => {
    const { data, isLoading } = useGetAllCategoriesQuery({});
    const allCategories: ICategory[] = data?.data?.data ?? [];

    // Only render published / active categories
    //  const categories = allCategories.filter((category) => {
    //   if (category?.is_deleted) return false;
    //   if (category?.is_active === false) return false;
    //   if (category?.is_published === false) return false;
    //   if (category?.status && HIDDEN_CATEGORY_STATUSES.includes(category.status))
    //    return false;
    //   return true;
    //  });
    const categories = allCategories;

    if (isLoading) return <CategoryRowSkeleton />;

    return (
        <>
            {categories.map((category) => (
                <CategoryRow key={category?._id} category={category} />
            ))}
        </>
    );
};

const CategoryRow = ({ category }: { category: ICategory }) => {
    const categoryId = category?._id;
    const title = category?.name_en || '';
    const slug = category?.slug;

    const { data, isLoading } = useGetProductsByCategoryQuery({
        categoryId,
        page: 1,
        limit: 20
    });

    const products: IProduct[] = data?.data?.data ?? [];
    const subcategories: ISubCategory[] = category?.subcategories ?? [];

    if (isLoading) return <CategoryRowSkeleton />;

    // Hide categories that have no products
    if (products.length === 0) return null;

    return (
        <Container className='group relative py-2 sm:py-8'>
            <div className='mb-2 flex items-center justify-between sm:mb-2'>
                <SectionTitle title={title} />
                <SectionLink label='View All' url={`/category/${slug}`} />
            </div>

            {/* Subcategory pills */}
            {subcategories.length > 0 && (
                <div className='-mx-1 mb-3 no-scrollbar flex items-center gap-2 overflow-x-auto px-1 sm:mb-4'>
                    {subcategories.map((sub) => (
                        <Link
                            key={sub?._id}
                            href={`/products/${sub?.slug}`}
                            className='shrink-0 rounded-full border border-primary px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-primary transition-colors hover:bg-primary hover:text-white sm:text-sm'
                        >
                            {sub?.name_en}
                        </Link>
                    ))}
                </div>
            )}

            <div className='relative'>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={isDesktop ? 20 : 8}
                    navigation={{
                        prevEl: `.prev-btn-${categoryId}`,
                        nextEl: `.next-btn-${categoryId}`
                    }}
                    breakpoints={{
                        320: { slidesPerView: 2 }, // Mobile
                        1024: { slidesPerView: 5 } // Desktop
                    }}
                    className='mySwiper'
                >
                    {products?.map((item) => {
                        const id = item?._id || '';
                        const thumbnail = item?.thumbnail;
                        const productTitle = item?.name || '';
                        const url = `/product/${item?.slug}`;

                        const oldPrice = item?.variants?.[0]?.regular_price;
                        const newPrice = item?.variants?.[0]?.sale_price;

                        return (
                            <SwiperSlide key={id}>
                                <motion.a
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 1 * 0.1,
                                        ease: 'easeOut'
                                    }}
                                    viewport={{ once: false, amount: 0.2 }}
                                    href={url}
                                    className='group/item block'
                                >
                                    {/* Image Wrapper */}
                                    <div className='relative mb-2 aspect-square overflow-hidden rounded-t-sm border border-gray-200 bg-[#F3F3F3] transition-colors group-hover/item:border-primary lg:mb-4'>
                                        <Image
                                            src={getMediaUrl(thumbnail)}
                                            alt={productTitle}
                                            fill
                                            className='object-contain transition-transform duration-500 group-hover/item:scale-105'
                                        />
                                    </div>

                                    {/* Details Wrapper */}
                                    <div className='mb-1'>
                                        <h3 className='lg-medium line-clamp-1 font-medium text-primary'>
                                            {productTitle}
                                        </h3>

                                        {/* Price Container */}
                                        <PriceContainer
                                            newPrice={newPrice}
                                            oldPrice={oldPrice}
                                        />
                                    </div>
                                </motion.a>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <button
                    className={`prev-btn-${categoryId} absolute top-[40%] left-[-20px] z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-black disabled:hidden`}
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    className={`next-btn-${categoryId} absolute top-[40%] right-[-20px] z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-black disabled:hidden`}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </Container>
    );
};

const CategoryRowSkeleton = () => (
    <Container className='py-2 lg:py-8'>
        <div className='mb-6 h-8 w-48 animate-pulse bg-gray-200' />
        <div className='grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5'>
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className='aspect-square animate-pulse rounded-lg bg-gray-100'
                />
            ))}
        </div>
    </Container>
);

export default CategoryProducts;
