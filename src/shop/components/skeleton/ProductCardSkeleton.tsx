'use client';

export default function ProductCardSkeleton() {
    return (
        <div className='h-full animate-pulse bg-white p-2'>
            {/* Image Skeleton */}
            <div className='h-48 w-full bg-gray-200'></div>

            {/* Content */}
            <div className='space-y-3 py-4'>
                {/* Brand + Rating */}
                <div className='flex items-center justify-between'>
                    <div className='h-3 w-16 bg-gray-200'></div>
                    <div className='h-3 w-10 bg-gray-200'></div>
                </div>

                {/* Title */}
                <div className='space-y-2'>
                    <div className='h-4 w-full bg-gray-200'></div>
                    <div className='h-4 w-3/4 bg-gray-200'></div>
                </div>

                {/* Price + Cart */}
                <div className='flex items-center justify-between pt-1'>
                    <div className='flex items-baseline gap-2'>
                        <div className='h-5 w-20 bg-gray-200'></div>
                        <div className='h-4 w-14 bg-gray-200'></div>
                    </div>

                    {/* Cart Icon */}
                    <div className='h-10 w-10 bg-gray-200'></div>
                </div>

                {/* Optional low-stock placeholder */}
                <div className='h-3 w-32 bg-gray-200'></div>
            </div>
        </div>
    );
}
