'use client';

export default function ProductDetailsSkeleton() {
    return (
        <div className='min-h-screen animate-pulse bg-gray-50'>
            <div className='container mx-auto py-8'>
                <div className='mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2'>
                    {/* Left side - Image */}
                    <div className='space-y-4'>
                        <div className='relative aspect-square rounded-lg bg-gray-200' />
                        <div className='flex gap-4'>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className='h-20 w-20 rounded-lg bg-gray-200'
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right side - Details */}
                    <div className='space-y-6'>
                        <div className='h-4 w-32 rounded bg-gray-200' />
                        <div className='h-6 w-3/4 rounded bg-gray-200' />

                        <div className='flex items-center gap-4'>
                            <div className='h-4 w-20 rounded bg-gray-200' />
                            <div className='h-4 w-16 rounded bg-gray-200' />
                        </div>

                        <div className='h-6 w-20 rounded bg-gray-200' />
                        <div className='flex gap-3 pt-1'>
                            <div className='h-10 flex-1 rounded bg-gray-200' />
                            <div className='h-10 flex-1 rounded bg-gray-200' />
                        </div>

                        <div className='grid grid-cols-3 gap-4 border-t pt-6'>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className='h-16 rounded-md bg-gray-200'
                                />
                            ))}
                        </div>

                        <div className='pt-4 md:flex md:gap-4'>
                            <div className='h-12 flex-1 rounded bg-gray-200' />
                            <div className='h-12 flex-1 rounded bg-gray-200' />
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className='space-y-3'>
                    <div className='h-5 w-40 rounded bg-gray-200' />
                    <div className='space-y-2'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className='h-4 w-full rounded bg-gray-200'
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
