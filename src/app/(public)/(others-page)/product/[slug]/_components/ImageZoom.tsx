'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/public-utils';
import { Play } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle
} from '@/components/public/ui/dialog';
import { getMediaUrl } from '@/lib/get-media-url';
import type { ShortVideo } from './ProductShortVideos';

// Convert a ratio string like "9:16" into a CSS aspect-ratio value
const ratioToAspect = (ratio?: string): string => {
    if (!ratio) return '9 / 16';
    const [w, h] = ratio.split(':').map((n) => Number(n));
    if (!w || !h) return '9 / 16';
    return `${w} / ${h}`;
};

// Updated to match your console log: Simple string arrays
const ImageZoom = ({
    images = [],
    videos = [],
    shortVideos = []
}: {
    images: string[];
    videos: string[];
    // Product-level short videos (story / reels). Constant per product —
    // NOT affected by variant selection.
    shortVideos?: ShortVideo[];
}) => {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [zoomIndex, setZoomIndex] = useState<number | null>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [activeImgMobile, setActiveImgMobile] = useState(images?.[0]);
    const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);

    // Sync mobile active image when images change (e.g., color selection)
    useEffect(() => {
        if (images?.length > 0) {
            setActiveImgMobile(images?.[0]);
        }
    }, [images]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } =
            e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setPosition({ x, y });
    };

    return (
        <div className='flex flex-col gap-2 md:gap-4'>
            {/* ================= PC LAYOUT: 2 per row ================= */}
            <div className='hidden grid-cols-2 gap-2 md:grid'>
                {images?.map?.((imgUrl, i) => (
                    <div
                        key={i}
                        className='relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-[#F3F3F3]'
                        onMouseEnter={() => setZoomIndex(i)}
                        onMouseLeave={() => setZoomIndex(null)}
                        onMouseMove={handleMouseMove}
                    >
                        <Image
                            src={getMediaUrl(imgUrl)}
                            alt={`product-${i}`}
                            className='h-full w-full object-contain p-8'
                            width={800}
                            height={800}
                            priority={i < 2}
                        />

                        {zoomIndex === i && (
                            <div
                                className='pointer-events-none absolute inset-0 z-10 hidden md:block'
                                style={{
                                    backgroundImage: `url(${getMediaUrl(imgUrl)})`,
                                    backgroundPosition: `${position.x}% ${position.y}%`,
                                    backgroundSize: '250%',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* ================= MOBILE LAYOUT: Slider style ================= */}
            <div className='flex flex-col gap-4 md:hidden'>
                <div
                    className='relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-[#F3F3F3]'
                    onClick={() => setIsMobileZoomOpen(true)} // Open zoom on click
                >
                    <Image
                        src={getMediaUrl(activeImgMobile) || '/placeholder.png'}
                        alt='product mobile'
                        fill
                        sizes='100vw'
                        className='object-contain p-2'
                    />
                    {/* Visual indicator for zoom */}
                    <div className='absolute right-3 bottom-3 rounded-full bg-white/80 p-1.5 shadow-sm'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        >
                            <circle cx='11' cy='11' r='8' />
                            <line x1='21' y1='21' x2='16.65' y2='16.65' />
                            <line x1='11' y1='8' x2='11' y2='14' />
                            <line x1='8' y1='11' x2='14' y2='11' />
                        </svg>
                    </div>
                </div>

                {(images?.length ?? 0) > 1 && (
                    <div className='no-scrollbar flex gap-2 overflow-x-auto pb-2'>
                        {images?.map?.((imgUrl, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImgMobile(imgUrl)}
                                className={cn(
                                    'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-[#F3F3F3] transition-all',
                                    activeImgMobile === imgUrl
                                        ? 'border-black'
                                        : 'border-transparent opacity-60'
                                )}
                            >
                                <Image
                                    src={getMediaUrl(imgUrl)}
                                    alt='thumb'
                                    fill
                                    sizes='80px'
                                    className='object-contain p-2'
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= VIDEOS SECTION ================= */}
            {videos?.length > 0 && (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {videos?.map?.((vidUrl, idx) => (
                        <div
                            key={idx}
                            className='group relative aspect-video cursor-pointer overflow-hidden rounded-xl bg-black'
                            onClick={() => setSelectedVideo(vidUrl)}
                        >
                            {/* Note: Using a video tag as a preview since we don't have a poster string anymore */}
                            <video
                                src={getMediaUrl(vidUrl)}
                                className='h-full w-full object-cover opacity-60'
                                muted
                            />
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-colors group-hover:bg-white/40'>
                                    <Play
                                        fill='white'
                                        className='ml-1 text-white'
                                        size={20}
                                    />
                                </div>
                            </div>
                            <div className='absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4'>
                                <p className='text-[10px] font-bold tracking-widest text-white uppercase'>
                                    Watch Video{' '}
                                    {(videos?.length ?? 0) > 1 ? idx + 1 : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ========= PRODUCT SHORT VIDEOS (always last) ========= */}
            {shortVideos?.length > 0 && (
                <div className='grid grid-cols-4 gap-3 md:grid-cols-5'>
                    {shortVideos?.map?.((sv, idx) => (
                        <button
                            key={idx}
                            type='button'
                            onClick={() => setSelectedVideo(sv.url)}
                            className='group relative overflow-hidden rounded-md bg-black md:rounded-xl'
                            style={{ aspectRatio: ratioToAspect(sv.ratio) }}
                            aria-label={
                                sv.title || `Play short video ${idx + 1}`
                            }
                        >
                            <video
                                src={getMediaUrl(sv.url)}
                                poster={
                                    sv.thumbnail
                                        ? getMediaUrl(sv.thumbnail)
                                        : undefined
                                }
                                muted
                                playsInline
                                preload='metadata'
                                className='h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100'
                            />
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <div className='flex h-11 w-11 items-center justify-center rounded-full bg-white/25 backdrop-blur-md transition-colors group-hover:bg-white/40'>
                                    <Play
                                        fill='white'
                                        className='ml-0.5 text-white'
                                        size={18}
                                    />
                                </div>
                            </div>
                            {sv.title && (
                                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5'>
                                    <p className='line-clamp-2 text-left text-[11px] leading-tight font-medium text-white'>
                                        {sv.title}
                                    </p>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ================= VIDEO MODAL ================= */}
            <Dialog
                open={!!selectedVideo}
                onOpenChange={() => setSelectedVideo(null)}
            >
                <DialogContent className='flex max-w-5xl items-center justify-center overflow-hidden border-none bg-black p-0'>
                    <DialogTitle className='sr-only'>Product Video</DialogTitle>
                    {selectedVideo && (
                        <video
                            src={getMediaUrl(selectedVideo)}
                            controls
                            autoPlay
                            className='mx-auto max-h-[85vh] w-auto max-w-full object-contain'
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* ================= MOBILE ZOOM MODAL ================= */}
            <Dialog open={isMobileZoomOpen} onOpenChange={setIsMobileZoomOpen}>
                <DialogContent className='flex h-screen max-w-[100vw] items-center justify-center border-none bg-white p-0'>
                    <DialogTitle className='sr-only'>Zoom View</DialogTitle>
                    <div className='relative flex h-full w-full items-center justify-center overflow-auto'>
                        <Image
                            src={getMediaUrl(activeImgMobile)}
                            alt='Zoomed product'
                            width={1200}
                            height={1200}
                            className='h-auto min-h-[50vh] w-full object-contain'
                            priority
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImageZoom;
