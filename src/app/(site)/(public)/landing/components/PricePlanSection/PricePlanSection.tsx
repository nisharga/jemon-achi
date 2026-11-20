'use client';

import { SectionHeading } from '@/app/(site)/(public)/components';
import { Button } from '@/components/core';
import { PRICE_PLAN_SECTION } from '@/static';
import { FC, useState } from 'react';
import PricePlanCard from './PricePlanCard';

const { heading, plans } = PRICE_PLAN_SECTION;

const PricePlanSection: FC = () => {
    const [pricingModel, setPricingModel] = useState('monthly');

    return (
        <section id='pricing' className='scroll-m-16 py-8'>
            <div className='container'>
                <SectionHeading
                    className='mx-auto mb-16! md:w-4/5 md:text-center'
                    {...heading}
                />

                <div className='mb-14 flex items-center justify-center gap-4'>
                    <Button
                        color={
                            pricingModel === 'monthly' ? 'primary' : 'secondary'
                        }
                        className='px-12!'
                        onClick={() => setPricingModel('monthly')}
                    >
                        Monthly
                    </Button>
                    <Button
                        color={
                            pricingModel === 'yearly' ? 'primary' : 'secondary'
                        }
                        className='px-12!'
                        onClick={() => setPricingModel('yearly')}
                    >
                        Yearly
                    </Button>
                </div>
                <div className='flex grid-cols-2 flex-col gap-4 sm:grid md:gap-10 lg:grid-cols-3'>
                    {(plans ?? []).map(({ id, ...rest }) => (
                        <PricePlanCard
                            key={id}
                            {...{ ...rest, pricingModel }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricePlanSection;
