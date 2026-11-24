import { cacheLife, cacheTag } from 'next/cache';
import { API_BASE_URL } from '@/shop/config';
import type {
    HeroSlide,
    HomePageContent,
    ProductDetailData,
    ProductCategory,
    ProductSummary,
    SubCategory
} from '@/shop/types/storefront';

/**
 * Public storefront data, fetched on the SERVER (never in the browser).
 *
 * Why: pages that fetch in the browser show skeletons first and the real
 * content only after the JavaScript has loaded and the API has answered
 * (6–17 s on a phone). Fetching here puts the content in the very first HTML.
 *
 * `'use cache'` keeps each answer for a few minutes, so the shop pages are
 * built once and served instantly instead of calling the API on every visit.
 * Call `revalidateTag('storefront')` to refresh everything at once.
 */

type ApiEnvelope<T> = { success: boolean; data: T };

/** Logs each warning only once per server start (cached pages re-run often in dev). */
const warned = new Set<string>();
const warnOnce = (message: string) => {
    if (warned.has(message)) return;
    warned.add(message);
    console.warn(message);
};

/**
 * GET a public endpoint and return its `data`, or `fallback` when there is none.
 *
 * - 404 / 400: nothing there; `fallback` is cached like a normal answer.
 * - server down or 5xx: `fallback` is cached for a few seconds only, so the
 *   page recovers as soon as the API is back.
 */
async function getPublic<T>(path: string, fallback: T): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`);

        if (response.status >= 500) {
            throw new Error(`API answered ${response.status} for ${path}`);
        }
        if (!response.ok) {
            warnOnce(`[storefront-api] ${response.status} for ${path}`);
            return fallback;
        }

        const body = (await response.json()) as ApiEnvelope<T>;
        return body.data ?? fallback;
    } catch (error) {
        console.error('[storefront-api]', error);
        cacheLife('seconds');
        return fallback;
    }
}

/** Slides of the big video banner at the top of the home page. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    return getPublic<HeroSlide[]>('/cms/hero-section', []);
}

/** Home page sections managed in the admin CMS (best selling, …). */
export async function getHomePageContent(): Promise<HomePageContent | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    return getPublic<HomePageContent | null>(
        '/cms/homepage?populate=full',
        null
    );
}

/** Every published category, with its subcategories. */
export async function getCategories(): Promise<ProductCategory[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    const result = await getPublic<{ data: ProductCategory[] }>(
        '/category/published/all',
        { data: [] }
    );
    return result.data ?? [];
}

/** The first products of one category (for the home page rows). */
export async function getCategoryProducts(
    categoryId: string,
    limit = 20
): Promise<ProductSummary[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    const result = await getPublic<{ data: ProductSummary[] }>(
        `/product/category/subcategory?category_id=${categoryId}&page=1&limit=${limit}`,
        { data: [] }
    );
    return result.data ?? [];
}

/** The first page of a random product mix ("Explore more products"). */
export async function getRandomProducts(limit = 20): Promise<ProductSummary[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    const result = await getPublic<{ products: ProductSummary[] }>(
        `/product/public/random?page=1&limit=${limit}`,
        { products: [] }
    );
    return result.products ?? [];
}

/** Subcategories of one category, found by the category's slug. */
export async function getSubCategoriesOf(
    categorySlug: string
): Promise<SubCategory[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    return getPublic<SubCategory[]>(
        `/sub-category/by-category-slug/${encodeURIComponent(categorySlug)}`,
        []
    );
}

/** One product with everything its page shows first (GET /product/slug/:slug). */
export async function getProduct(
    slug: string
): Promise<ProductDetailData | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront', `product-${slug}`);
    const result = await getPublic<{ product: ProductDetailData | null }>(
        `/product/slug/${encodeURIComponent(slug)}`,
        { product: null }
    );
    return result.product ?? null;
}

/**
 * Slugs of the newest published products, to build their pages ahead of
 * time. Products not in this list are built on their first visit.
 */
export async function getProductSlugs(limit = 200): Promise<string[]> {
    'use cache';
    cacheLife('hours');
    cacheTag('storefront');
    const result = await getPublic<{
        products: { slug: string; is_published?: boolean }[];
    }>(`/product?page=1&limit=${limit}`, { products: [] });
    return (result.products ?? [])
        .filter((product) => product.is_published !== false)
        .map((product) => product.slug);
}

/** Messages rotating in the black bar above the header (set in the admin CMS). */
export async function getTopBarMessages(): Promise<string[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag('storefront');
    return getPublic<string[]>('/cms/top-bar-messages', []);
}
