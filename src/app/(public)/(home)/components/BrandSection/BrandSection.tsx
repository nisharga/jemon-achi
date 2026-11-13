import { Icons } from '@/components/Icons';
import { BRAND_SECTION } from '@/static';
import Image from 'next/image';

const { heading, brands } = BRAND_SECTION;

// Brands that ship as inline SVG components (theme-aware fill) instead of images.
const INLINE_BRAND_ICONS: Record<string, React.ReactNode> = {
    '/images/brands/tru-brand-1.svg': (
        <Icons.Nable className='w-60 fill-black dark:fill-white' />
    ),
    '/images/brands/tru-brand-5.svg': (
        <Icons.SuperOps className='fill-black dark:fill-white' />
    ),
    '/images/brands/tru-brand-6.svg': (
        <Icons.Pax8 className='fill-black dark:fill-white' />
    )
};

const BrandSection = () => {
    return (
        <section id='connectors' className='scroll-m-12 py-16'>
            <div className='container'>
                <h2 className='mb-14 text-center text-3xl text-gray-900 dark:text-gray-100'>
                    {heading.title}
                </h2>

                <div className='flex flex-wrap items-center justify-center gap-7'>
                    {(brands ?? []).map(({ logo }) => (
                        <div data-aos='zoom-in' key={logo}>
                            {INLINE_BRAND_ICONS[logo] ?? (
                                <Image
                                    className='h-10 w-auto basis-1/6'
                                    src={logo}
                                    width={100}
                                    height={60}
                                    unoptimized
                                    alt='tru-brand'
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandSection;
