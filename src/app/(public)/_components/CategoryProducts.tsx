import Link from 'next/link';
import type {
    ProductCategory,
    ProductSummary
} from '@/types/public/storefront';
import {
    Container,
    ProductRail,
    ProductTile,
    SectionLink,
    SectionTitle
} from '@/components';

export type CategoryRow = {
    category: ProductCategory;
    products: ProductSummary[];
};

/** One row per category: its name, subcategory shortcuts and products. */
export default function CategoryProducts({ rows }: { rows: CategoryRow[] }) {
    return (
        <>
            {rows
                // Categories without products are left out.
                .filter((row) => row.products.length > 0)
                .map(({ category, products }) => (
                    <Container key={category._id} className='py-2 sm:py-8'>
                        <div className='mb-2 flex items-center justify-between'>
                            <SectionTitle title={category.name_en} />
                            <SectionLink
                                label='View All'
                                url={`/category/${category.slug}`}
                            />
                        </div>

                        {(category.subcategories?.length ?? 0) > 0 && (
                            <div className='-mx-1 mb-3 no-scrollbar flex gap-2 overflow-x-auto px-1 sm:mb-4'>
                                {category.subcategories!.map((sub) => (
                                    <Link
                                        key={sub._id}
                                        href={`/products/${sub.slug}`}
                                        className='text-primary-ink shrink-0 rounded-full border border-primary px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm'
                                    >
                                        {sub.name_en}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <ProductRail label={`${category.name_en} products`}>
                            {products.map((product) => (
                                <ProductTile
                                    key={product._id}
                                    product={product}
                                    sizes='(min-width: 1024px) 20vw, 50vw'
                                />
                            ))}
                        </ProductRail>
                    </Container>
                ))}
        </>
    );
}
