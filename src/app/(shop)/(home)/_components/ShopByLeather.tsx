'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/shop/components/common/container';
import SectionLink from '@/shop/components/global/SectionLink';
import SectionTitle from '@/shop/components/global/SectionTitle';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { useGetCmsHomePageQuery } from '@/shop/redux/api/publicApi';
import { motion } from 'framer-motion';
import PriceContainer from '@/shop/components/common/PriceContainer';

// Import Swiper React components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isDesktop } from '@/shop/lib/utils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

interface IItem {
    _id: string;
    name: string;
    slug: string;
    thumbnail: string;
    new_price?: number; // Added if your API provides it
    old_price?: number; // Added if your API provides it
    variants: {
        regular_price: number;
        sale_price: number;
    }[];
}

const ShopByLeather = () => {
    const { data, isLoading } = useGetCmsHomePageQuery({});

    // Dynamic access based on your API structure
    const leatherProducts = data?.data?.leather_section?.product_ids || [];
    const enabled = data?.data?.leather_section?.enabled;
    const title = data?.data?.leather_section?.title || '';
    const btn_label = data?.data?.leather_section?.button_text || '';
    const btn_url = data?.data?.leather_section?.button_link || '/';

    if (isLoading) {
        return <ShopByLeatherSkeleton />;
    }

    return (
        <Container
            className={`group relative py-2 sm:py-8 ${enabled ? 'block' : 'hidden'}`}
        >
            <div className='mb-2 flex items-center justify-between sm:mb-4'>
                <SectionTitle title={title} />
                <SectionLink label={btn_label} url={btn_url} />
            </div>

            <div className='relative'>
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={isDesktop ? 16 : 8}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    navigation={{
                        prevEl: '.leather-prev-btn',
                        nextEl: '.leather-next-btn'
                    }}
                    breakpoints={{
                        320: { slidesPerView: 2 }, // Mobile
                        768: { slidesPerView: 3 }, // Tablet
                        1280: { slidesPerView: 5 } // Desktop (5 items per row)
                    }}
                    className='mySwiper'
                >
                    {leatherProducts?.map((product: IItem, index: number) => {
                        const url = `/product/${product?.slug}`;

                        // Fallback mock prices if not provided directly by API yet
                        const currentPrice =
                            product?.variants[0]?.regular_price;
                        const previousPrice = product?.variants[0]?.sale_price;

                        return (
                            <SwiperSlide key={product._id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.05
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <Link
                                        href={url}
                                        className='group/item mb-1 block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md'
                                    >
                                        {/* TOP BOX: Image */}
                                        <div className='relative aspect-square w-full overflow-hidden bg-[#F3F3F3]'>
                                            <Image
                                                src={getMediaUrl(
                                                    product?.thumbnail
                                                )}
                                                alt={product?.name}
                                                fill
                                                className='object-contain transition-transform duration-500 group-hover/item:scale-105'
                                                priority={index < 5}
                                            />
                                        </div>

                                        {/* BOTTOM BOX: Text Details */}
                                        <div className='p-2 lg:p-4'>
                                            <h3 className='lg-medium line-clamp-1 font-medium text-gray-800 transition-colors group-hover/item:text-primary lg:mb-1'>
                                                {product?.name}
                                            </h3>

                                            {/* Price Element */}
                                            <PriceContainer
                                                newPrice={currentPrice}
                                                oldPrice={previousPrice}
                                                className='!gap-1.5 lg:gap-2'
                                            />
                                        </div>
                                    </Link>
                                </motion.div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Unique Custom Navigation Buttons to avoid conflict with other sliders */}
                <button className='leather-prev-btn absolute top-[40%] left-[-6px] z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white shadow-md transition-all hover:bg-black disabled:hidden sm:left-[-8px] sm:h-10 sm:w-10 lg:left-[-16px]'>
                    <ChevronLeft size={24} />
                </button>
                <button className='leather-next-btn absolute top-[40%] right-[-6px] z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white shadow-md transition-all hover:bg-black disabled:hidden sm:right-[-8px] sm:h-10 sm:w-10 lg:right-[-16px]'>
                    <ChevronRight size={24} />
                </button>
            </div>
        </Container>
    );
};

const ShopByLeatherSkeleton = () => (
    <Container className='py-4 sm:py-8'>
        <div className='mb-8 flex justify-between'>
            <div className='h-8 w-48 animate-pulse rounded bg-gray-200' />
            <div className='h-6 w-20 animate-pulse rounded bg-gray-200' />
        </div>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className='aspect-[4/5] w-full animate-pulse rounded-lg bg-gray-100'
                />
            ))}
        </div>
    </Container>
);

export default ShopByLeather;
