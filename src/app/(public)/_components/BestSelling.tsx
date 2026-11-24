import { Container } from '@/shop/components/common/container';
import ProductRail from '@/shop/components/common/ProductRail';
import ProductTile from '@/shop/components/common/ProductTile';
import SectionLink from '@/shop/components/global/SectionLink';
import SectionTitle from '@/shop/components/global/SectionTitle';
import type { ProductSummary } from '@/shop/types/storefront';

/** Sideways-scrolling row of the best selling products (chosen in the admin CMS). */
type Props = {
    products: ProductSummary[];
    /** True when this row is on screen without scrolling (no banner above it). */
    isNearTop: boolean;
};

/** On phones two tiles are visible at once. */
const TILES_VISIBLE_ON_PHONE = 2;

export default function BestSelling({ products, isNearTop }: Props) {
    if (products.length === 0) return null;

    return (
        <Container className='py-2 sm:py-8'>
            <div className='mb-2 flex items-center justify-between sm:mb-4'>
                <SectionTitle title='Best Selling' />
                <SectionLink label='View All' url='/products/best-selling' />
            </div>

            <ProductRail label='Best selling products'>
                {products.map((product, index) => (
                    <ProductTile
                        key={product._id}
                        product={product}
                        sizes='(min-width: 1024px) 20vw, 50vw'
                        priority={isNearTop && index < TILES_VISIBLE_ON_PHONE}
                    />
                ))}
            </ProductRail>
        </Container>
    );
}
