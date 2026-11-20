'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Smartphone,
    Share2,
    MessageCircle,
    Settings
} from 'lucide-react';
import Image from 'next/image';
import { Container } from '@/shop/components/common/container';
import { useGetAllSlidesQuery } from '@/shop/redux/api/slider-api';
import HeroImageSkeleton, {
    SlideCardSkeleton
} from '@/shop/components/skeleton/HeroImageSkeleton';
import HeroSkeleton from '@/shop/components/skeleton/HeroSkeleton';
import Link from 'next/link';

const HeroMain = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const {
        data: data = [],
        isLoading: isLoadingSlides,
        isError: isErrorSlides
    } = useGetAllSlidesQuery({});

    const slides = data?.data?.banners ?? [];
    const mobile_banners = data?.data?.mobile_banners ?? [];
    const featured_products = data?.data?.featured_products ?? [];

    const features = [
        {
            icon: Smartphone,
            title: 'Outfit Finder',
            description: 'Find Outfit for Gadgets'
        },
        {
            icon: Share2,
            title: 'Share Experience',
            description: 'We Value your Feedback'
        },
        {
            icon: MessageCircle,
            title: 'Online Support',
            description: 'Get Support on WhatsApp'
        },
        {
            icon: Settings,
            title: 'Customer Care',
            description: 'Repair Your Device'
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === slides.length - 1 ? 0 : prev + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    if (isErrorSlides) {
        return null;
    }

    if (isLoadingSlides) {
        return <HeroSkeleton />;
    }

    return (
        <Container className='px-0 py-0 sm:px-2 sm:py-4 lg:px-4'>
            {/* Main Hero Section: The container handles the full width and overall padding */}

            <div className='mb-2 lg:mb-4'>
                {/* 1. Side Cards */}
                <div className='hidden grid-cols-3 gap-4 lg:grid'>
                    {/* SLIDER (Takes up 2/3 width) */}
                    <div className='relative lg:col-span-2'>
                        <div className='relative h-50 overflow-hidden md:h-125'>
                            {isLoadingSlides ? (
                                <HeroImageSkeleton
                                    currentSlide={currentSlide}
                                />
                            ) : (
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 300 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -300 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: [0.25, 0.46, 0.45, 0.94]
                                        }}
                                        className='absolute inset-0'
                                    >
                                        <Link
                                            href={`/featured/ids=${slides[
                                                currentSlide
                                            ]?.products_id?.join(',')}`}
                                            className='relative block h-full w-full'
                                        >
                                            <Image
                                                sizes='100vw'
                                                fill
                                                src={
                                                    slides[currentSlide]
                                                        ?.banner_url
                                                }
                                                alt={`Product ${currentSlide + 1}`}
                                                className='h-full w-full object-cover'
                                                priority={currentSlide === 0}
                                            />
                                        </Link>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            {/* Navigation Controls (Prev/Next/Dots) */}
                            <button
                                onClick={prevSlide}
                                className='absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white'
                                aria-label='Prev Slide'
                            >
                                <ChevronLeft className='size-4 text-slate-700 md:size-6' />
                            </button>
                            <button
                                onClick={nextSlide}
                                className='absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white'
                                aria-label='Next Slide'
                            >
                                <ChevronRight className='size-4 text-slate-700 md:size-6' />
                            </button>
                            <div className='absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2'>
                                {isLoadingSlides
                                    ? ''
                                    : slides?.map((_: any, index: number) => (
                                          <button
                                              aria-label='Slide dots'
                                              key={index}
                                              onClick={() =>
                                                  setCurrentSlide(index)
                                              }
                                              className={`h-3 rounded-full transition-all duration-300 ${
                                                  index === currentSlide
                                                      ? 'w-8 bg-primary'
                                                      : 'w-3 bg-white/60 hover:bg-white/80'
                                              }`}
                                          />
                                      ))}
                            </div>
                        </div>
                    </div>

                    {/* SIDE CARDS (Takes up 1/3 width, stacked vertically) */}
                    <div className='grid grid-cols-1 gap-4'>
                        {/* Use a simple grid for stacking */}
                        {isLoadingSlides ? (
                            <SlideCardSkeleton />
                        ) : (
                            mobile_banners?.map((card: any) => (
                                <div
                                    key={card.id}
                                    className='group relative h-full cursor-pointer overflow-hidden transition-all duration-300'
                                >
                                    <Link
                                        href={`/featured/ids=${slides[
                                            currentSlide
                                        ]?.products_id?.join(',')}`}
                                        className='relative block aspect-2/1 h-full w-full'
                                    >
                                        {/* Using aspect ratio for height control */}
                                        <Image
                                            sizes='100vw'
                                            fill
                                            src={card?.banner_url}
                                            alt={`Side product`}
                                            className='h-full w-full object-cover transition-transform duration-300'
                                        />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. MD/SM Layout (Only Slider, Full Width) */}
                {/* This structure is ONLY visible between 'sm' and 'lg' screen sizes. */}
                <div className='hidden sm:block lg:hidden'>
                    {/* SLIDER (Full Width) */}
                    <div className='relative'>
                        <div className='relative h-50 overflow-hidden md:h-125'>
                            {/* SLIDER CONTENT HERE (Identical to LG slider content, but full width) */}
                            {/* ... (AnimatePresence, motion.div, Image, Nav buttons, Dots) ... */}
                            {isLoadingSlides ? (
                                <HeroImageSkeleton
                                    currentSlide={currentSlide}
                                />
                            ) : (
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 300 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -300 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: [0.25, 0.46, 0.45, 0.94]
                                        }}
                                        className='absolute inset-0'
                                    >
                                        <div className='relative h-full w-full'>
                                            <Image
                                                sizes='100vw'
                                                fill
                                                src={
                                                    slides[currentSlide]
                                                        ?.banner_url
                                                }
                                                alt={`Product ${currentSlide + 1}`}
                                                className='h-full w-full object-cover'
                                                priority={currentSlide === 0}
                                            />
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            <button
                                onClick={prevSlide}
                                className='absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white'
                                aria-label='Prev Slide'
                            >
                                <ChevronLeft className='size-4 text-slate-700 md:size-6' />
                            </button>
                            <button
                                onClick={nextSlide}
                                className='absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white'
                                aria-label='Next Slide'
                            >
                                <ChevronRight className='size-4 text-slate-700 md:size-6' />
                            </button>

                            <div className='absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2'>
                                {isLoadingSlides
                                    ? ''
                                    : slides?.map((_: any, index: number) => (
                                          <button
                                              key={index}
                                              onClick={() =>
                                                  setCurrentSlide(index)
                                              }
                                              aria-label='Slide Dots'
                                              className={`h-3 rounded-full transition-all duration-300 ${
                                                  index === currentSlide
                                                      ? 'w-8 bg-primary' // Darker orange for better contrast
                                                      : 'w-3 bg-gray-400 group-hover:bg-gray-300' // Solid color instead of opacity
                                              }`}
                                          />
                                      ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Mobile Layout (Slider + Side Cards stacked at the bottom) */}
                {/* This structure is ONLY visible on 'sm' screens and smaller. */}
                <div className='mb-2 grid grid-cols-1 gap-2 sm:mb-4 sm:hidden sm:gap-4'>
                    {/* SLIDER (Full Width) */}
                    <div className='relative'>
                        <div className='relative h-50 overflow-hidden md:h-125'>
                            {/* SLIDER CONTENT HERE (Identical to MD/SM slider content) */}
                            {/* ... (AnimatePresence, motion.div, Image, Nav buttons, Dots) ... */}
                            {isLoadingSlides ? (
                                <HeroImageSkeleton
                                    currentSlide={currentSlide}
                                />
                            ) : (
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 300 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -300 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: [0.25, 0.46, 0.45, 0.94]
                                        }}
                                        className='absolute inset-0'
                                    >
                                        <div className='relative h-full w-full'>
                                            <Image
                                                sizes='100vw'
                                                fill
                                                src={
                                                    slides[currentSlide]
                                                        ?.banner_url
                                                }
                                                alt={`Product ${currentSlide + 1}`}
                                                className='h-full w-full object-cover'
                                                priority={currentSlide === 0}
                                            />
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            <button
                                onClick={prevSlide}
                                className='absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white'
                                aria-label='Prev Slide'
                            >
                                <ChevronLeft className='size-4 text-slate-700 md:size-6' />
                            </button>
                            <button
                                onClick={nextSlide}
                                className='absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-white'
                                aria-label='Next Slide'
                            >
                                <ChevronRight className='size-4 text-slate-700 md:size-6' />
                            </button>

                            <div className='absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2'>
                                {isLoadingSlides
                                    ? ''
                                    : slides?.map((_: any, index: any) => (
                                          <button
                                              aria-label='Slide dots'
                                              key={index}
                                              onClick={() =>
                                                  setCurrentSlide(index)
                                              }
                                              className={`h-3 rounded-full transition-all duration-300 ${
                                                  index === currentSlide
                                                      ? 'w-8 bg-primary'
                                                      : 'w-3 bg-white/60 hover:bg-white/80'
                                              }`}
                                          />
                                      ))}
                            </div>
                        </div>
                    </div>

                    {/* SIDE CARDS (Stacked below the slider on mobile) */}
                    <div className='grid grid-cols-2 gap-2 sm:gap-4'>
                        {/* Side-by-side on mobile */}
                        {isLoadingSlides ? (
                            <>
                                <SlideCardSkeleton />
                                <SlideCardSkeleton />
                            </>
                        ) : (
                            featured_products?.map((card: any) => (
                                <div
                                    key={card?.id}
                                    className='group relative h-full cursor-pointer overflow-hidden transition-all duration-300'
                                >
                                    <div className='relative aspect-2/1 h-full w-full'>
                                        <Image
                                            sizes='100vw'
                                            fill
                                            src={card.banner_url}
                                            alt={`Side product`}
                                            className='h-full w-full object-cover transition-transform duration-300'
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Hero cards list */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className='hidden grid-cols-2 gap-2 px-2 sm:px-0 md:grid lg:grid-cols-4 lg:gap-6'
            >
                {(features ?? []).map((feature, index) => (
                    <div
                        key={index}
                        className='group cursor-pointer rounded bg-white px-2 py-2 shadow transition-all duration-300 hover:shadow-lg sm:px-4 sm:py-4'
                    >
                        <div className='flex items-center gap-2 sm:items-start sm:gap-4'>
                            <div className='rounded-full border border-gray-100 bg-primary p-2 transition-transform duration-200 group-hover:scale-110 sm:p-3'>
                                <feature.icon className='size-4 text-white md:size-6' />
                            </div>
                            <div className='flex-1'>
                                <h3 className='mb-1 text-sm font-medium text-slate-800 transition-colors duration-200 group-hover:text-primary md:text-base'>
                                    {feature?.title}
                                </h3>
                                <p className='hidden text-sm leading-relaxed text-slate-600 md:block'>
                                    {feature?.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </Container>
    );
};

export default HeroMain;
