import { Metadata } from 'next';
import ProductDetail from './_components/ProductDetail';
import { API_BASE_URL, CLOUDFRONT_BASE_URL, FRONTEND_URL } from '@/shop/config';
import { getMediaUrl } from '@/shop/lib/get-media-url';

// 1. UPDATE INTERFACE: params must be a Promise in Next.js 15
interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const res = await fetch(`${API_BASE_URL}/product/slug/${slug}`, {
            next: { revalidate: 3600 }
        });

        const result = await res?.json();
        const product = result?.data?.product;

        if (!product) return { title: 'Product Not Found' };

        const name = product?.name ?? 'Product';
        const description = (product?.description ?? '').replace(
            /<[^>]*>/g,
            ''
        );

        // CRITICAL FIX: Make the image URL absolute
        const imageRelativePath = product?.thumbnail ?? '';
        const fullImageUrl = getMediaUrl(imageRelativePath);

        return {
            title: `${name} | Griipbuddy`,
            description: description,
            keywords: product?.search_tags ?? [],
            openGraph: {
                title: `${name} | Griipbuddy`,
                description: description,
                url: `${FRONTEND_URL}/product/${slug}`,
                siteName: 'Griipbuddy',
                type: 'website',
                images: [
                    {
                        url: fullImageUrl,
                        width: 1200,
                        height: 630,
                        alt: name
                    }
                ],
                locale: 'en_US'
            },
            // Twitter needs specific tags sometimes for WhatsApp to pick them up too
            twitter: {
                card: 'summary_large_image',
                title: name,
                description: description,
                images: [fullImageUrl]
            },
            // OTHER USEFUL TAGS
            robots: {
                index: true,
                follow: true
            }
        };
    } catch (error) {
        return { title: 'Product Detail' };
    }
}

const Page = async ({ params }: Props) => {
    // 3. AWAIT the params promise here too
    const { slug } = await params;
    return <ProductDetail slug={slug} />;
};

export default Page;
