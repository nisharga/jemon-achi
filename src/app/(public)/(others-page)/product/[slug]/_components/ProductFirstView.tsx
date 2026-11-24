import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/shop/components/common/container';
import PriceContainer from '@/shop/components/common/PriceContainer';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import type { ProductDetailData } from '@/shop/types/storefront';

/**
 * The top of a product page (main picture, name, price), rendered on the
 * server. It is what the customer sees first, while the interactive part
 * (variants, stock, offers, reviews) loads in the browser and then takes over
 * in exactly the same place.
 *
 * Its layout copies the top of <ProductDetail /> so nothing moves when the
 * interactive version replaces it.
 */
export default function ProductFirstView({
    product
}: {
    product: ProductDetailData;
}) {
    const price = product.variants?.[0];

    return (
        <Container className='min-h-screen py-4 sm:py-8'>
            <div className='flex flex-col gap-4 lg:flex-row lg:gap-12'>
                <div className='w-full lg:w-[60%]'>
                    <div className='relative aspect-square overflow-hidden rounded-xl bg-[#F3F3F3] md:max-w-[calc(50%-0.25rem)]'>
                        <Image
                            src={getMediaUrl(product.thumbnail)}
                            alt={product.name}
                            fill
                            sizes='(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw'
                            // The biggest thing on the page: load it first.
                            preload
                            fetchPriority='high'
                            className='object-contain p-2 md:p-8'
                        />
                    </div>
                </div>

                <div className='w-full space-y-2 lg:w-[40%]'>
                    {product.category && (
                        <Link
                            href={`/category/${product.category.slug}`}
                            className='sm-normal-gray block'
                        >
                            {product.category.name_en}
                        </Link>
                    )}
                    <h1 className='two-xl-medium tracking-tight lg:text-3xl'>
                        {product.name}
                    </h1>
                    <PriceContainer
                        newPrice={price?.sale_price ?? product.min_price ?? 0}
                        oldPrice={price?.regular_price ?? 0}
                    />
                </div>
            </div>
        </Container>
    );
}
