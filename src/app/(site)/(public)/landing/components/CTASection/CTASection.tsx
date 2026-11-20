import { Icons } from '@/components/Icons';
import { Button } from '@/components/core';
import { CTA_SECTION } from '@/static';

const { heading, link } = CTA_SECTION;

const CTASection = () => {
    return (
        <section className='mb-20 py-16'>
            <div className='container'>
                <div
                    data-aos='fade-up'
                    className='rounded-2xl bg-cta-section-bg px-8 py-10 text-center lg:px-12'
                >
                    <h2 className='mb-8 text-3xl leading-tight! text-white xs:text-4xl xl:text-5xl'>
                        {heading.title}
                    </h2>
                    <p className='mb-8 font-light text-white lg:px-10'>
                        {heading.description}
                    </p>

                    <Button
                        href={link.url}
                        className='flex items-center justify-center gap-2'
                        color='primary'
                    >
                        {link.label} <Icons.ArrowRight />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
