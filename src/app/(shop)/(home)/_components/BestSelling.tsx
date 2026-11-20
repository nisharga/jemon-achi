'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/shop/components/common/container';
import SectionTitle from '@/shop/components/global/SectionTitle';
import { useGetCmsHomePageQuery } from '@/shop/redux/api/publicApi';
import SectionLink from '@/shop/components/global/SectionLink';
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

interface IProps {
    product_id: {
        _id: number;
        image: string;
        name: string;
        slug: string;
        thumbnail: string;
        media: any;
        variants: {
            regular_price: number;
            sale_price: number;
        }[];
    };
    _id: string;
}

const BestSelling = () => {
    const { data, isLoading } = useGetCmsHomePageQuery({});
    const bestSelling = data?.data?.best_selling || [];

    if (isLoading) return <BestSellingSkeleton />;

    return (
        <Container className='group relative py-2 sm:py-8'>
            <div className='mb-2 flex items-center justify-between sm:mb-4'>
                <SectionTitle title='Best Selling' />
                <SectionLink label='View All' url='/products/best-selling' />
            </div>

            <div className='relative'>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={isDesktop ? 20 : 8}
                    navigation={{
                        prevEl: '.prev-btn',
                        nextEl: '.next-btn'
                    }}
                    breakpoints={{
                        320: { slidesPerView: 2 }, // Mobile
                        1024: { slidesPerView: 5 } // Desktop
                    }}
                    className='mySwiper'
                >
                    {bestSelling?.map((item: IProps) => {
                        const id = item?._id || '';
                        const thumbnail = item?.product_id?.thumbnail;
                        const title = item?.product_id?.name || '';
                        const url = `/product/${item?.product_id?.slug}`;

                        const oldPrice =
                            item?.product_id?.variants?.[0]?.regular_price ?? 0;
                        const newPrice =
                            item?.product_id?.variants?.[0]?.sale_price ?? 0;

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
                                    <div className='relative mb-2 aspect-square overflow-hidden rounded-t-sm bg-[#F3F3F3] lg:mb-4'>
                                        <Image
                                            src={getMediaUrl(thumbnail)}
                                            alt={title}
                                            fill
                                            className='object-contain transition-transform duration-500 group-hover/item:scale-105'
                                        />
                                    </div>

                                    {/* Details Wrapper */}
                                    <div className='mb-1'>
                                        <h3 className='lg-medium line-clamp-1 font-medium text-gray-800'>
                                            {title}
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
                <button className='prev-btn absolute top-[40%] left-[-20px] z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-black disabled:hidden'>
                    <ChevronLeft size={24} />
                </button>
                <button className='next-btn absolute top-[40%] right-[-20px] z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-black disabled:hidden'>
                    <ChevronRight size={24} />
                </button>
            </div>
        </Container>
    );
};

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

export default BestSelling;
