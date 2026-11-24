import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FRONTEND_URL } from '@/shop/config';
import { getMediaUrl } from '@/shop/lib/get-media-url';
import { getProduct, getProductSlugs } from '@/shop/server/storefront-api';
import ProductDetail from './_components/ProductDetail';
import ProductFirstView from './_components/ProductFirstView';

type Props = { params: Promise<{ slug: string }> };

/**
 * Product pages are built ahead of time for the newest products, so they
 * arrive as finished HTML. Any other product is built on its first visit and
 * then saved like the others.
 */
export async function generateStaticParams() {
    const slugs = await getProductSlugs();
    // Next.js needs at least one entry; this only happens when the API is down during the build.
    if (slugs.length === 0) return [{ slug: 'unavailable' }];
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: 'Product not found' };

    // Plain text for search engines and link previews (WhatsApp, Facebook…).
    const description = (product.description ?? '').replace(/<[^>]*>/g, '');
    const image = getMediaUrl(product.thumbnail);

    return {
        title: product.name,
        description,
        keywords: product.search_tags ?? [],
        openGraph: {
            title: product.name,
            description,
            url: `${FRONTEND_URL}/product/${slug}`,
            siteName: 'Griipbuddy',
            type: 'website',
            images: [
                { url: image, width: 1200, height: 630, alt: product.name }
            ],
            locale: 'en_US'
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description,
            images: [image]
        }
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) notFound();

    return (
        <ProductDetail
            slug={slug}
            firstView={<ProductFirstView product={product} />}
        />
    );
}
