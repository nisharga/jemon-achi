'use client';
import GlobalLoader from '@/shop/components/common/GlobalLoader';
import { ProductCardSkeleton } from '@/shop/components/skeleton';
import { IProduct } from '@/shop/types/product';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

const ProductCard = dynamic(
    () => import('@/shop/components/common/product-card'),
    {
        loading: () => <GlobalLoader /> // Optional skeleton
    }
);

interface IProps {
    setSlug: React.Dispatch<React.SetStateAction<string>>;
    productData: any;
    isLoading: boolean;
}

export default function CategoryPage({ setSlug, productData, isLoading }: any) {
    const params = useParams();

    // Extract name safely (params.name could be a string or string[])
    const categoryName = Array.isArray(params.name)
        ? params.name[0]
        : params.name;

    useEffect(() => {
        if (categoryName) {
            setSlug(categoryName);
        }
    }, [categoryName, setSlug]);

    const handleAddToCart = () => {
        console.debug('product added');
    };
    const handleBuyNow = () => {
        console.debug('buy product');
    };

    return (
        <>
            {isLoading ? (
                // Show Skeletons while loading
                [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : productData && productData.length > 0 ? (
                // Show Products if data exists
                productData?.map((product: IProduct) => (
                    <ProductCard
                        key={product._id || product.id} // Better to use a unique ID than index
                        product={product as any}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                    />
                ))
            ) : (
                // Show Empty State if not loading and no data
                <div className='col-span-full py-10 text-center text-gray-500'>
                    No products found in this category.
                </div>
            )}
        </>
    );
}
