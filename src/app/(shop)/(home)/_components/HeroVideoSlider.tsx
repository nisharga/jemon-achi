'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetAllSlidesVideoQuery } from '@/shop/redux/api/slider-api';
import Image from 'next/image';
import { getMediaUrl } from '@/shop/lib/get-media-url';

const HeroVideoSlider = () => {
    const {
        data: data = [],
        isLoading: isLoadingSlides,
        isError: isErrorSlides
    } = useGetAllSlidesVideoQuery({});

    const slides = data?.data ?? [];

    const [currentIndex, setCurrentIndex] = useState(0);
    //   fetching
    const videoUrl = slides[currentIndex]?.video_url || '';
    const posterUrl = slides[currentIndex]?.thumbnail_url || '';
    const isCtaButtonEnable = slides[currentIndex]?.button?.enabled || false;
    const title = slides[currentIndex]?.title || '';
    const ctaLabel = slides[currentIndex]?.button?.text || '';
    const ctaUrl = slides[currentIndex]?.button?.redirect_route || '';

    const [isReady, setIsReady] = useState(false);
    const [hasError, setHasError] = useState(false);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Reset states when the index changes (new slide)
    useEffect(() => {
        setIsReady(false);
        setHasError(false);
    }, [currentIndex]);

    if (isLoadingSlides) {
        return <HeroVideoSkeleton />;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className='relative h-[48vh] w-full overflow-hidden bg-black text-white md:h-screen lg:h-[90vh]'
        >
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className='absolute inset-0 h-full w-full bg-black'
                >
                    {/* 1. Dark Overlay (Always on top of media) */}
                    <div className='absolute inset-0 z-10 bg-black/30' />

                    {/* 2. Fallback Image (Visible while loading or if video fails) */}
                    {(!isReady || hasError) && (
                        <Image
                            src={getMediaUrl(posterUrl)}
                            alt='Loading fallback'
                            className='absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-500'
                            width={800}
                            height={450}
                        />
                    )}

                    {/* 3. The Video Tag */}
                    {!hasError && (
                        <video
                            key={videoUrl} // Forcing re-render on URL change helps reliability
                            src={getMediaUrl(videoUrl)}
                            autoPlay
                            muted
                            loop
                            playsInline
                            onLoadedData={() => setIsReady(true)} // Fires when frame 1 is ready
                            onError={() => setHasError(true)} // Fires if link is broken
                            className={`h-full w-full object-cover transition-opacity duration-700 ${
                                isReady ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                    )}

                    <div className='absolute inset-0 z-20 flex flex-col justify-end px-6 pb-20 md:justify-center md:px-20 md:pb-0'>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className='max-w-3xl'
                        >
                            <h1 className='hero-slider-text mb-4 lg:mb-8'>
                                {title}
                            </h1>

                            {isCtaButtonEnable && (
                                <motion.a
                                    href={ctaUrl}
                                    className='btn-label cursor-pointer rounded-full border border-white/40 bg-white/10 px-4 py-1.5 backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black lg:px-8 lg:py-3'
                                >
                                    {ctaLabel}
                                </motion.a>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className='absolute top-1/2 left-4 z-30 hidden -translate-y-1/2 cursor-pointer p-2 text-white/50 transition-colors hover:text-white lg:block'
            >
                <ChevronLeft size={40} strokeWidth={1} />
            </button>

            <button
                onClick={nextSlide}
                className='absolute top-1/2 right-4 z-30 hidden -translate-y-1/2 cursor-pointer p-2 text-white/50 transition-colors hover:text-white lg:block'
            >
                <ChevronRight size={40} strokeWidth={1} />
            </button>

            {/* Pagination Dots */}
            <div className='absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3'>
                {slides?.map((_: any, idx: any) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                            currentIndex === idx
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/40'
                        }`}
                    />
                ))}
            </div>
        </motion.section>
    );
};

export default HeroVideoSlider;

const HeroVideoSkeleton = () => {
    return (
        <div className='relative mt-4 h-[48vh] w-full overflow-hidden bg-neutral-900 md:h-screen lg:h-[90vh]'>
            {/* Shimmering Background Effect */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className='absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent'
            />

            {/* Content Skeleton */}
            <div className='absolute inset-0 z-10 flex flex-col justify-end px-6 pb-20 md:justify-center md:px-20 md:pb-0'>
                <div className='max-w-3xl space-y-6'>
                    {/* Title Line 1 */}
                    <div className='h-8 w-3/4 animate-pulse rounded-lg bg-white/10 md:h-16' />
                    {/* Title Line 2 */}
                    <div className='h-8 w-1/2 animate-pulse rounded-lg bg-white/10 md:h-16' />

                    {/* Button Skeleton */}
                    <div className='mt-8 h-12 w-32 animate-pulse rounded-full bg-white/10' />
                </div>
            </div>

            {/* Navigation Arrow Skeletons */}
            <div className='absolute top-1/2 left-4 h-10 w-10 -translate-y-1/2 rounded-full bg-white/5' />
            <div className='absolute top-1/2 right-4 h-10 w-10 -translate-y-1/2 rounded-full bg-white/5' />

            {/* Dots Skeleton */}
            <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3'>
                <div className='h-1.5 w-8 rounded-full bg-white/20' />
                <div className='h-1.5 w-2 rounded-full bg-white/10' />
                <div className='h-1.5 w-2 rounded-full bg-white/10' />
            </div>
        </div>
    );
};
