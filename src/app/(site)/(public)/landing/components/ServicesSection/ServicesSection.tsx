import { SectionHeading } from '@/app/(site)/(public)/components';
import { SERVICES_SECTION } from '@/static';
import ServiceCard from './ServiceCard';

const { heading, services } = SERVICES_SECTION;

const ServicesSection = () => {
    return (
        <section className='py-16'>
            <div className='container'>
                <SectionHeading {...heading} className='mb-14 lg:w-3/5' />
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {(services ?? []).map(({ id, ...rest }) => (
                        <ServiceCard {...rest} key={id} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
