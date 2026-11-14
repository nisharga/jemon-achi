import { Icons } from '@/components/Icons';
import { Button } from '@/components/core';
import { HERO_SECTION } from '@/static';
const {
    heading: { title, description },
    features,
    buttons
} = HERO_SECTION;

const HeroSection = () => {
    return (
        <section className='flex min-h-[calc(100vh-90px)] items-center justify-center bg-hero-pattern bg-cover bg-center bg-no-repeat py-10 dark:bg-linear-to-t dark:from-gray-950 dark:to-gray-950'>
            <div className='container'>
                <div className='mb-10 text-center'>
                    {/* Above the fold: no AOS here. AOS hides elements until it
                        starts, which would delay the LCP headline. */}
                    <h1 className='mx-auto mb-6 w-full text-[46px] leading-tight! font-semibold text-gray-900 xs:text-5xl lg:w-4/5 lg:text-6xl dark:text-gray-100'>
                        {title.split('%').map((str, i: number) => (
                            <span
                                className={`${
                                    i === 1 ? 'text-primary-900' : ''
                                }`}
                                key={str}
                            >
                                {str}
                            </span>
                        ))}
                    </h1>
                    <p className='mx-auto w-full text-2xl leading-normal font-light lg:w-4/5'>
                        {description}
                    </p>
                </div>

                <div className='mb-14 flex flex-wrap items-center justify-center gap-5'>
                    {(features ?? []).map(({ id, label, icon }) => {
                        return (
                            <div
                                key={id}
                                className='inline-flex items-center justify-center gap-4 rounded-full border-[1.5px] border-primary-100 px-6 py-3'
                            >
                                {icon}
                                {label}
                            </div>
                        );
                    })}
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4'>
                    {(buttons ?? []).map(({ url, label, type }) => (
                        <Button
                            key={url}
                            href={url}
                            className='flex items-center justify-center gap-2'
                            color={type === 'primary' ? 'primary' : 'secondary'}
                        >
                            {label}
                            <Icons.ArrowRight />
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
