// components/VariantSelectorSkeleton.tsx
import React from 'react';

const VariantSelectorSkeleton: React.FC = () => {
    return (
        <div className='animate-pulse space-y-3'>
            {/* Title placeholder */}
            <div className='h-4 w-40 rounded bg-gray-200'></div>

            {/* Variant buttons placeholders */}
            <div className='flex flex-wrap gap-3'>
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className='h-8 w-20 rounded-lg bg-gray-200'
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default VariantSelectorSkeleton;
