import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/get-media-url';
import { getCategories, getSubCategoriesOf } from '@/server/storefront-api';
import { EmptyProducts } from '../../products/[slug]/_components/EmptyProduct';

type Props = { params: Promise<{ slug: string }> };

/** "bags" → "Bags", "screen-protector" → "Screen protector" */
const toTitle = (slug: string) => {
    const words = decodeURIComponent(slug).replaceAll('-', ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return { title: toTitle(slug) };
}

/**
 * Every category page is built ahead of time (one per category), so it
 * arrives as finished HTML. A category added later is built on its first
 * visit and then saved like the others.
 */
export async function generateStaticParams() {
    const categories = await getCategories();
    // Next.js needs at least one entry; "all" only happens when the API is down during the build.
    if (categories.length === 0) return [{ slug: 'all' }];
    return categories.map((category) => ({ slug: category.slug }));
}

/** A category page (/category/bags): a grid of its subcategories. */
export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const subCategories = await getSubCategoriesOf(slug);

    if (subCategories.length === 0) {
        return <EmptyProducts categoryName={slug} type='category' />;
    }

    return (
        <section className='mx-auto min-h-screen max-w-7xl px-4 py-4 sm:py-12'>
            <h1 className='mb-4 text-center text-xl font-medium tracking-widest uppercase sm:mb-12 md:text-2xl'>
                {toTitle(slug)}
            </h1>

            <ul className='grid grid-cols-2 gap-2 sm:gap-x-4 sm:gap-y-12 lg:grid-cols-6'>
                {subCategories.map((sub, index) => (
                    <li key={sub._id}>
                        <Link
                            href={`/products/${sub.slug}`}
                            className='group flex flex-col items-center'
                        >
                            <div className='relative mb-4 aspect-square w-full overflow-hidden rounded-t-lg bg-[#F5F5F5] transition-transform duration-300 group-hover:scale-105'>
                                <Image
                                    src={getMediaUrl(sub.media?.[0]?.image)}
                                    alt={sub.name_en}
                                    fill
                                    sizes='(min-width: 1024px) 16vw, 50vw'
                                    // The first rows are on screen without scrolling.
                                    loading={index < 4 ? 'eager' : 'lazy'}
                                    fetchPriority={
                                        index < 2 ? 'high' : undefined
                                    }
                                    className='object-contain'
                                />
                            </div>
                            <h2 className='px-2 text-center text-[11px] font-bold tracking-wider uppercase transition-colors group-hover:text-neutral-600 md:text-sm'>
                                {sub.name_en}
                            </h2>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
