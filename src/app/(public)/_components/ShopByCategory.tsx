import Image from 'next/image';
import Link from 'next/link';
import { getCategoryImage } from '@/lib/category-image';
import { getMediaUrl } from '@/lib/get-media-url';
import type { ProductCategory } from '@/types/public/storefront';
import { Container, SectionTitle } from '@/components';

type Props = {
    categories: ProductCategory[];
    /** True when this grid is the first thing on the page (no hero banner). */
    isFirstSection: boolean;
};

/** Grid of category pictures, each linking to its category page. */
export default function ShopByCategory({ categories, isFirstSection }: Props) {
    if (categories.length === 0) return null;

    return (
        <Container className='py-2 sm:py-8'>
            <div className='mb-2 sm:mb-4'>
                <SectionTitle title='Shop By Category' />
            </div>

            <ul className='grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-6 xl:grid-cols-9'>
                {categories.map((category, index) => (
                    <li key={category._id}>
                        <Link
                            href={`/category/${category.slug}`}
                            className='group block'
                        >
                            <div className='relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-b from-[#E3F2FD] via-[#F3F9FD] to-white shadow-sm transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-md'>
                                <Image
                                    src={getMediaUrl(
                                        getCategoryImage(category.media)
                                    )}
                                    alt={category.name_en}
                                    fill
                                    sizes='(min-width: 1280px) 11vw, (min-width: 1024px) 16vw, (min-width: 768px) 25vw, 33vw'
                                    // The first row is on screen straight away when there is no banner.
                                    loading={
                                        isFirstSection && index < 3
                                            ? 'eager'
                                            : 'lazy'
                                    }
                                    preload={isFirstSection && index === 0}
                                    className='object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105'
                                />
                            </div>
                            <p className='mt-3 line-clamp-1 px-1 text-center text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600 md:text-base'>
                                {category.name_en}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </Container>
    );
}
