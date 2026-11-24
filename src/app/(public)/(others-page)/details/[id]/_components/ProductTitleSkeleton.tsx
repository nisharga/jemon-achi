// components/ProductTitleSkeleton.tsx
import React from 'react';

const ProductTitleSkeleton: React.FC = () => {
    return (
        <div className='animate-pulse space-y-2'>
            <div className='h-4 w-32 rounded bg-gray-200'></div>{' '}
            {/* Category */}
            <div className='h-6 w-64 rounded bg-gray-200'></div>{' '}
            {/* Product Name */}
        </div>
    );
};

export default ProductTitleSkeleton;
