'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { cn } from '@/shop/lib/utils';
import type { HeroSlide } from '@/shop/types/storefront';

/**
 * The big banner at the top of the home page. Each slide is a looping video
 * with a still picture (the "poster") shown until the video can play.
 *
 * Speed: the first poster is in the server HTML and preloaded, so it is the
 * first big thing the customer sees. Videos are only added once the page is
 * interactive, so their download never delays that first picture.
 */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
    const isMounted = useMounted();
    const [current, setCurrent] = useState(0);
    const [videoIsPlaying, setVideoIsPlaying] = useState(false);

    const slide = slides[current];
    const isFirstSlide = current === 0;

    const showSlide = (index: number) => {
        // Wrap around at both ends.
        setCurrent((index + slides.length) % slides.length);
        setVideoIsPlaying(false);
    };

    return (
        <section
            aria-label='Featured'
            className='relative h-[48vh] w-full overflow-hidden bg-black text-white md:h-screen lg:h-[90vh]'
        >
            {/* Poster picture, under the video until the video plays. */}
            {slide.thumbnail_url && (
                <Image
                    key={`poster-${current}`}
                    src={getMediaUrl(slide.thumbnail_url)}
                    alt=''
                    fill
                    sizes='100vw'
                    preload={isFirstSlide}
                    loading={isFirstSlide ? 'eager' : 'lazy'}
                    fetchPriority={isFirstSlide ? 'high' : undefined}
                    className={cn(
                        'object-cover transition-opacity duration-500',
                        videoIsPlaying && 'opacity-0'
                    )}
                />
            )}

            {isMounted && slide.video_url && (
                <video
                    key={`video-${current}`}
                    src={getMediaUrl(slide.video_url)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onPlaying={() => setVideoIsPlaying(true)}
                    className={cn(
                        'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
                        videoIsPlaying ? 'opacity-100' : 'opacity-0'
                    )}
                />
            )}

            {/* Darken the picture so the white text is readable. */}
            <div className='absolute inset-0 bg-black/30' />

            <div className='absolute inset-0 flex flex-col justify-end px-6 pb-20 md:justify-center md:px-20 md:pb-0'>
                <div className='max-w-3xl'>
                    {slide.title && (
                        <h1 className='hero-slider-text mb-4 lg:mb-8'>
                            {slide.title}
                        </h1>
                    )}
                    {slide.button?.enabled && slide.button.redirect_route && (
                        <Link
                            href={slide.button.redirect_route}
                            className='btn-label rounded-full border border-white/40 bg-white/10 px-4 py-1.5 backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black lg:px-8 lg:py-3'
                        >
                            {slide.button.text}
                        </Link>
                    )}
                </div>
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        type='button'
                        onClick={() => showSlide(current - 1)}
                        aria-label='Previous slide'
                        className='absolute top-1/2 left-4 hidden -translate-y-1/2 p-2 text-white/50 transition-colors hover:text-white lg:block'
                    >
                        <ChevronLeft size={40} strokeWidth={1} />
                    </button>
                    <button
                        type='button'
                        onClick={() => showSlide(current + 1)}
                        aria-label='Next slide'
                        className='absolute top-1/2 right-4 hidden -translate-y-1/2 p-2 text-white/50 transition-colors hover:text-white lg:block'
                    >
                        <ChevronRight size={40} strokeWidth={1} />
                    </button>

                    <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3'>
                        {slides.map((item, index) => (
                            <button
                                key={item._id ?? index}
                                type='button'
                                onClick={() => showSlide(index)}
                                aria-label={`Show slide ${index + 1}`}
                                aria-current={current === index}
                                className={cn(
                                    'h-1.5 rounded-full transition-all duration-300',
                                    current === index
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/40'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
