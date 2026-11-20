// components/ProductDescription.tsx
import React from 'react';

interface ProductDescriptionProps {
    description?: string;
    isLoading?: boolean;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
    description,
    isLoading = false
}) => {
    if (isLoading) return <ProductDescriptionSkeleton />;

    if (!description) return null;

    return (
        <div
            className='prose max-w-full text-gray-700'
            dangerouslySetInnerHTML={{ __html: description }}
        />
    );
};

export default ProductDescription;

const ProductDescriptionSkeleton: React.FC = () => {
    return (
        <div className='animate-pulse space-y-2'>
            <div className='h-4 w-32 rounded bg-gray-200'></div>
            <div className='h-4 w-full rounded bg-gray-200'></div>
            <div className='h-4 w-full rounded bg-gray-200'></div>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
            <div className='h-4 w-3/4 rounded bg-gray-200'></div>
        </div>
    );
};
