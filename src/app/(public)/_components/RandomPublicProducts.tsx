import { Container } from '@/shop/components/common/container';
import ProductTile from '@/shop/components/common/ProductTile';
import SectionTitle from '@/shop/components/global/SectionTitle';
import type { ProductCategory, ProductSummary } from '@/shop/types/storefront';
import { GRID_TILE_SIZES, RANDOM_PAGE_SIZE } from '../_lib/constants';
import MoreRandomProducts from './MoreRandomProducts';

type Props = {
    /** First page, fetched on the server. */
    products: ProductSummary[];
    /** For the "choose a category" sheet that pops up while scrolling. */
    categories: ProductCategory[];
};

/**
 * "Explore More Products": a grid that keeps loading more products as the
 * customer scrolls. The first page is server-rendered; the rest are loaded
 * in the browser by <MoreRandomProducts />.
 */
export default function RandomPublicProducts({ products, categories }: Props) {
    if (products.length === 0) return null;

    return (
        <Container className='py-2 sm:py-8'>
            <div className='mb-2 sm:mb-4'>
                <SectionTitle title='Explore More Products' />
            </div>

            <ul className='grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-5 xl:grid-cols-5'>
                {products.map((product) => (
                    <li key={product._id}>
                        <ProductTile
                            product={product}
                            sizes={GRID_TILE_SIZES}
                        />
                    </li>
                ))}
                <MoreRandomProducts
                    hasMoreAfterFirstPage={products.length >= RANDOM_PAGE_SIZE}
                    shownOnServer={products.length}
                    categories={categories}
                />
            </ul>
        </Container>
    );
}
