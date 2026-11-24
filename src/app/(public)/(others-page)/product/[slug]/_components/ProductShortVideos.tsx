'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Play,
    X,
    ChevronLeft,
    ChevronRight,
    Volume2,
    VolumeX
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle
} from '@/components/public/ui/dialog';
import { getMediaUrl } from '@/lib/get-media-url';
import { cn } from '@/lib/public-utils';

export type ShortVideo = {
    url: string;
    format?: string;
    ratio?: string;
    size?: number;
    thumbnail?: string;
    title?: string;
    duration?: number;
};

// Convert a ratio string like "9:16" into a CSS aspect-ratio value
const ratioToAspect = (ratio?: string): string => {
    if (!ratio) return '9 / 16';
    const [w, h] = ratio.split(':').map((n) => Number(n));
    if (!w || !h) return '9 / 16';
    return `${w} / ${h}`;
};

const ProductShortVideos = ({ videos }: { videos?: ShortVideo[] }) => {
    const list = (videos ?? []).filter((v) => v?.url);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [muted, setMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const isOpen = activeIndex !== null;

    const close = useCallback(() => setActiveIndex(null), []);
    const goTo = useCallback(
        (next: number) => {
            if (!list.length) return;
            const bounded = (next + list.length) % list.length;
            setActiveIndex(bounded);
        },
        [list.length]
    );

    // Keyboard navigation while the viewer is open
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goTo((activeIndex ?? 0) + 1);
            else if (e.key === 'ArrowLeft') goTo((activeIndex ?? 0) - 1);
            else if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, activeIndex, goTo, close]);

    if (!list.length) return null;

    const active = activeIndex !== null ? list[activeIndex] : null;

    return (
        <section className='w-full md:hidden'>
            <div className='mb-4 flex items-center gap-2'>
                <h2 className='two-xl-medium'>See it in action</h2>
                <span className='text-xs text-gray-600'>
                    {list.length} {list.length > 1 ? 'videos' : 'video'}
                </span>
            </div>

            {/* Story-style horizontal rail */}
            <div className='no-scrollbar flex gap-3 overflow-x-auto pb-2'>
                {list.map((video, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setMuted(true);
                            setActiveIndex(i);
                        }}
                        className='group relative shrink-0 overflow-hidden rounded-2xl bg-black ring-1 ring-black/5 transition-transform hover:scale-[1.02]'
                        style={{
                            width: '150px',
                            aspectRatio: ratioToAspect(video.ratio)
                        }}
                        aria-label={video.title || `Play short video ${i + 1}`}
                    >
                        {video.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={getMediaUrl(
                                    'uploads/4a74c29c-ff37-43c8-8f85-2534bbfe87be.mp4'
                                )}
                                alt={video.title || `Short video ${i + 1}`}
                                className='h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100'
                            />
                        ) : (
                            <video
                                src={getMediaUrl(video.url)}
                                muted
                                playsInline
                                preload='metadata'
                                className='h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100'
                            />
                        )}

                        {/* Play badge */}
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <div className='flex h-11 w-11 items-center justify-center rounded-full bg-white/25 backdrop-blur-md transition-colors group-hover:bg-white/40'>
                                <Play
                                    fill='white'
                                    className='ml-0.5 text-white'
                                    size={18}
                                />
                            </div>
                        </div>

                        {/* Caption */}
                        {video.title && (
                            <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5'>
                                <p className='line-clamp-2 text-left text-[11px] leading-tight font-medium text-white'>
                                    {video.title}
                                </p>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Fullscreen vertical viewer */}
            <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
                <DialogContent className='flex h-[100dvh] max-w-none items-center justify-center border-none bg-black/95 p-0 sm:h-[90vh] sm:max-w-md'>
                    <DialogTitle className='sr-only'>
                        {active?.title || 'Product video'}
                    </DialogTitle>

                    {active && (
                        <div className='relative flex h-full w-full items-center justify-center'>
                            {/* Progress segments */}
                            <div className='absolute top-0 right-0 left-0 z-20 flex gap-1 p-3'>
                                {list.map((_, i) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            'h-1 flex-1 rounded-full transition-colors',
                                            i === activeIndex
                                                ? 'bg-white'
                                                : 'bg-white/30'
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Top controls */}
                            <div className='absolute top-7 right-3 z-20 flex items-center gap-2'>
                                <button
                                    onClick={() => setMuted((m) => !m)}
                                    className='flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30'
                                    aria-label={muted ? 'Unmute' : 'Mute'}
                                >
                                    {muted ? (
                                        <VolumeX size={18} />
                                    ) : (
                                        <Volume2 size={18} />
                                    )}
                                </button>
                                <button
                                    onClick={close}
                                    className='flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30'
                                    aria-label='Close'
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Video */}
                            <video
                                key={active.url}
                                ref={videoRef}
                                src={getMediaUrl(active.url)}
                                poster={
                                    active.thumbnail
                                        ? getMediaUrl(active.thumbnail)
                                        : undefined
                                }
                                className='h-full w-full object-contain'
                                style={{
                                    aspectRatio: ratioToAspect(active.ratio)
                                }}
                                autoPlay
                                muted={muted}
                                playsInline
                                controls
                                loop={list.length === 1}
                                onEnded={() =>
                                    list.length > 1 &&
                                    goTo((activeIndex ?? 0) + 1)
                                }
                            />

                            {/* Caption */}
                            {active.title && (
                                <div className='absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-5 pb-8'>
                                    <p className='text-sm font-medium text-white'>
                                        {active.title}
                                    </p>
                                </div>
                            )}

                            {/* Prev / Next (multi-video only) */}
                            {list.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            goTo((activeIndex ?? 0) - 1)
                                        }
                                        className='absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30'
                                        aria-label='Previous video'
                                    >
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            goTo((activeIndex ?? 0) + 1)
                                        }
                                        className='absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30'
                                        aria-label='Next video'
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default ProductShortVideos;
