'use client';

export default function ProductCardSkeleton() {
    return (
        <div className='w-full animate-pulse overflow-hidden rounded border border-gray-100 bg-white'>
            {/* Image placeholder */}
            <div className='h-[160px] w-full bg-gray-200' />

            <div className='space-y-3 p-3'>
                {/* Title */}
                <div className='h-4 w-3/4 rounded bg-gray-200' />
                {/* Category */}
                <div className='h-3 w-1/2 rounded bg-gray-200' />

                {/* Price */}
                <div className='h-5 w-1/4 rounded bg-gray-200' />

                {/* Buttons */}
                <div className='flex gap-1.5 pt-1'>
                    <div className='h-8 flex-1 rounded bg-gray-200' />
                    <div className='h-8 flex-1 rounded bg-gray-200' />
                </div>
            </div>
        </div>
    );
}
