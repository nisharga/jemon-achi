import { Container } from '../common/container';

export const HeroImageSkeleton = () => (
    <div className='relative h-full w-full animate-pulse bg-gray-200'>
        {/* Mimics the Nav buttons */}
        <div className='absolute top-1/2 left-4 h-10 w-10 -translate-y-1/2 rounded-full bg-gray-300' />
        <div className='absolute top-1/2 right-4 h-10 w-10 -translate-y-1/2 rounded-full bg-gray-300' />
        {/* Mimics the Dots */}
        <div className='absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2'>
            <div className='h-3 w-8 rounded-full bg-gray-300' />
            <div className='h-3 w-3 rounded-full bg-gray-300' />
            <div className='h-3 w-3 rounded-full bg-gray-300' />
        </div>
    </div>
);

export const SlideCardSkeleton = () => (
    <div className='aspect-2/1 h-full w-full animate-pulse rounded-lg border border-gray-100 bg-gray-200' />
);

export const FeatureCardSkeleton = () => (
    <div className='flex items-center gap-4 rounded border border-gray-50 bg-white px-4 py-4 shadow-sm'>
        <div className='h-12 w-12 animate-pulse rounded-full bg-gray-200' />
        <div className='flex-1 space-y-2'>
            <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
            <div className='hidden h-3 w-32 animate-pulse rounded bg-gray-100 md:block' />
        </div>
    </div>
);

export default function HeroSkeleton() {
    return (
        <Container className='px-0 py-0 sm:px-2 sm:py-4 lg:px-4'>
            <div className='mb-2 lg:mb-4'>
                {/* Desktop Skeleton */}
                <div className='hidden grid-cols-3 gap-4 lg:grid'>
                    <div className='relative h-50 overflow-hidden rounded-xl md:h-125 lg:col-span-2'>
                        <HeroImageSkeleton />
                    </div>
                    <div className='grid grid-cols-1 gap-4'>
                        <SlideCardSkeleton />
                        <SlideCardSkeleton />
                    </div>
                </div>

                {/* Tablet Skeleton */}
                <div className='hidden sm:block lg:hidden'>
                    <div className='relative h-50 overflow-hidden rounded-xl md:h-125'>
                        <HeroImageSkeleton />
                    </div>
                </div>

                {/* Mobile Skeleton */}
                <div className='grid grid-cols-1 gap-4 sm:hidden'>
                    <div className='relative h-50 overflow-hidden rounded-lg'>
                        <HeroImageSkeleton />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <SlideCardSkeleton />
                        <SlideCardSkeleton />
                    </div>
                </div>
            </div>

            {/* Bottom Features Skeleton */}
            <div className='mt-4 hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4 lg:gap-6'>
                {[1, 2, 3, 4].map((i) => (
                    <FeatureCardSkeleton key={i} />
                ))}
            </div>
        </Container>
    );
}
