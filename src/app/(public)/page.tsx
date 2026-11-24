import {
    getCategories,
    getCategoryProducts,
    getHeroSlides,
    getHomePageContent,
    getRandomProducts
} from '@/shop/server/storefront-api';
import type { ProductSummary } from '@/shop/types/storefront';
import { RANDOM_PAGE_SIZE } from './_lib/constants';
import BestSelling from './_components/BestSelling';
import CategoryProducts from './_components/CategoryProducts';
import HeroSlider from './_components/HeroSlider';
import RandomPublicProducts from './_components/RandomPublicProducts';
import ShopByCategory from './_components/ShopByCategory';
import StorefrontFrame from '@/shop/components/shared/StorefrontFrame';

/**
 * Storefront home page.
 *
 * A server component: all data is fetched here, on the server, so the page
 * arrives as finished HTML. The answers are cached (see storefront-api.ts),
 * so the page is built once and then served instantly.
 */
export default async function HomePage() {
    // Start every request at the same time instead of one after another.
    const [slides, homeContent, categories, randomProducts] = await Promise.all(
        [
            getHeroSlides(),
            getHomePageContent(),
            getCategories(),
            getRandomProducts(RANDOM_PAGE_SIZE)
        ]
    );

    const categoryRows = await Promise.all(
        categories.map(async (category) => ({
            category,
            products: await getCategoryProducts(category._id)
        }))
    );

    const bestSelling = (homeContent?.best_selling ?? [])
        .map((item) => item.product_id)
        .filter((product): product is ProductSummary => Boolean(product));

    return (
        // The home page header floats over the banner (isHome).
        <StorefrontFrame isHome>
            {slides.length > 0 && <HeroSlider slides={slides} />}
            <ShopByCategory
                categories={categories}
                isFirstSection={slides.length === 0}
            />
            <BestSelling
                products={bestSelling}
                isNearTop={slides.length === 0}
            />
            <CategoryProducts rows={categoryRows} />
            <RandomPublicProducts
                products={randomProducts}
                categories={categories}
            />
        </StorefrontFrame>
    );
}
