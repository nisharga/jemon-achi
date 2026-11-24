import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/get-media-url';
import type { ProductSummary } from '@/types/public/storefront';
import PriceContainer from './PriceContainer';

type Props = {
    product: ProductSummary;
    /** Width of the tile on each screen size, so the browser downloads the right image size. */
    sizes: string;
    /**
     * Set for the first tiles on screen when nothing bigger is above them:
     * the picture loads straight away, ahead of the page's JavaScript.
     */
    priority?: boolean;
};

/**
 * A product card: picture, name and price, linking to the product page.
 * Server component (no JavaScript); hover effects are plain CSS.
 */
export default function ProductTile({
    product,
    sizes,
    priority = false
}: Props) {
    const price = product.variants?.[0];

    return (
        <Link href={`/product/${product.slug}`} className='group/item block'>
            <div className='relative mb-2 aspect-square overflow-hidden rounded-t-sm bg-[#F3F3F3] lg:mb-4'>
                <Image
                    src={getMediaUrl(product.thumbnail)}
                    alt={product.name}
                    fill
                    sizes={sizes}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : undefined}
                    className='object-contain transition-transform duration-500 group-hover/item:scale-105'
                />
            </div>
            <div className='mb-1'>
                <h3 className='lg-medium line-clamp-1 font-medium text-gray-800'>
                    {product.name}
                </h3>
                <PriceContainer
                    newPrice={price?.sale_price ?? 0}
                    oldPrice={price?.regular_price ?? 0}
                />
            </div>
        </Link>
    );
}
