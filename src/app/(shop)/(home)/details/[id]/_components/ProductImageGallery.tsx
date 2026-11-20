import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Share2 } from 'lucide-react';

interface ProductImage {
    url: string;
    alt?: string;
    id: string | number;
}

interface ProductImageGalleryProps {
    images: ProductImage[];
    isLoading: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    images,
    isLoading
}) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    if (isLoading) return <ProductImageGallerySkeleton />;

    if (!images || images.length === 0) return null;

    return (
        <div className='space-y-4'>
            {/* Main Image */}
            <div className='relative aspect-square overflow-hidden bg-white md:size-[85%]'>
                <Image
                    src={images[selectedImage].url}
                    alt={
                        images[selectedImage].alt ||
                        `Product image ${selectedImage + 1}`
                    }
                    fill
                    className='object-cover'
                    priority={true}
                />
                <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className='absolute top-4 right-4 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white'
                >
                    <Heart
                        className={`h-6 w-6 ${
                            isWishlisted
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600'
                        }`}
                    />
                </button>
                <button className='absolute top-4 left-4 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white'>
                    <Share2 className='h-6 w-6 text-gray-600' />
                </button>
            </div>

            {/* Thumbnails */}
            <div className='flex gap-4'>
                {images.map((image, index) => (
                    <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square w-[100px] overflow-hidden rounded-xl border-2 bg-white transition-all ${
                            selectedImage === index
                                ? 'border-primary shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt || `Thumbnail ${index + 1}`}
                            fill
                            className='object-cover'
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductImageGallery;

const ProductImageGallerySkeleton: React.FC = () => {
    return (
        <div className='!w-[95%] animate-pulse space-y-4 space-x-4'>
            {/* Main Image Skeleton */}
            <div className='aspect-square w-full rounded-lg bg-gray-200'></div>

            {/* Thumbnails Skeleton */}
            <div className='flex gap-4'>
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className='aspect-square w-[100px] rounded-lg bg-gray-200'
                    ></div>
                ))}
            </div>
        </div>
    );
};
