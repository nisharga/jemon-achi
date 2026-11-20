'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Container } from '@/shop/components/common/container';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SectionTitle from '@/shop/components/global/SectionTitle';
import { isDesktop } from '@/shop/lib/utils';
import { useGetAllCategoriesQuery } from '@/shop/redux/api/category-api';
import { getMediaUrl } from '@/shop/lib/get-media-url';

export interface IProductCategory {
    _id: number;
    image: string;
    name_en: string;
    slug: string;
    media: any;
    image_url: any;
}

const ShopByCategory = () => {
    const [mounted, setMounted] = React.useState(false);
    const { data, isLoading } = useGetAllCategoriesQuery({});
    const categories = data?.data?.data || [];

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Framer Motion Variants for the Grid Container (Staggered Children)
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04 // Smooth cascade entry effect
            }
        }
    };

    // Variants for each individual card entry
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    } as any;

    return (
        <Container className='py-2 sm:py-8'>
            <div className='mb-2 sm:mb-4'>
                <SectionTitle title='Shop By Category' />
            </div>

            <div className='flex w-full items-center justify-center'>
                <motion.div
                    className='grid w-full max-w-[1600px] grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6 xl:grid-cols-9'
                    variants={containerVariants}
                    initial='hidden'
                    animate='show'
                >
                    {categories.map((category: IProductCategory) => {
                        const media = category?.media || [];

                        let displayImage = media?.find(
                            (m: any) => m.size === 'VERTICAL'
                        )?.image;

                        if (!displayImage) {
                            displayImage = media?.find(
                                (m: any) =>
                                    m.size === 'HORIZONTAL' ||
                                    m.size === 'SQUARE'
                            )?.image;
                        }

                        if (!displayImage) {
                            displayImage = media?.[0]?.image;
                        }

                        const url = `/category/${category?.slug}`;
                        const id = category?._id;

                        return (
                            <Link href={url} key={id}>
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{
                                        y: -6,
                                        transition: { duration: 0.2 }
                                    }}
                                    className='group flex cursor-pointer flex-col items-center rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md'
                                >
                                    {/* Image Container with Custom Sky Blue Gradient Background */}
                                    <div className='relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#E3F2FD] via-[#F3F9FD] to-white'>
                                        <motion.img
                                            src={getMediaUrl(displayImage)}
                                            alt={category?.name_en}
                                            className='h-full w-full object-contain mix-blend-multiply'
                                            loading='lazy'
                                            whileHover={{ scale: 1.06 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 20
                                            }}
                                        />
                                    </div>

                                    {/* Title text */}
                                </motion.div>
                                <motion.p className='mt-3 line-clamp-1 px-1 text-center text-sm font-medium text-gray-700 transition-colors duration-200 group-hover:text-blue-600 md:text-base'>
                                    {category?.name_en}
                                </motion.p>
                            </Link>
                        );
                    })}
                </motion.div>
            </div>
        </Container>
    );
};

export default ShopByCategory;
