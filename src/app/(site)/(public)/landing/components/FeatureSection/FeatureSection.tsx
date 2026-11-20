import { SectionHeading } from '@/app/(site)/(public)/components';
import IconList from '@/components/IconList';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/core';
import { FEATURE_SECTION } from '@/static';
import Image from 'next/image';

const { heading, image, link, list } = FEATURE_SECTION;

const FeatureSection = () => {
    return (
        <section id='features' className='scroll-m-12 py-16'>
            <div className='container'>
                <div className='grid gap-12 lg:grid-cols-2'>
                    <div className=''>
                        <SectionHeading className='mb-10' {...heading} />

                        <IconList list={list}>
                            <Icons.CheckCircle />
                        </IconList>

                        <Button
                            href={link.url}
                            className='flex items-center justify-center gap-2'
                            color='primary'
                        >
                            {link.label}
                            <Icons.ArrowRight />
                        </Button>
                    </div>
                    <div className=''>
                        <Image
                            src={image}
                            className='w-full'
                            alt='Truup dashboard overview'
                            width={1440}
                            height={1039}
                            sizes='(min-width: 1280px) 1216px, 100vw'
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
