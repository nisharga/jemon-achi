import { Button } from '@/components/core';
import { FC } from 'react';

interface IProps {
    name: string;
    description: string;
    price: {
        monthly: string;
        yearly: string;
    };
    features: string[];
    actionButton: {
        label: string;
        url: string;
    };
    pricingModel: string;
}

const PricePlanCard: FC<IProps> = ({
    name,
    price,
    features,
    actionButton,
    pricingModel,
    description
}) => {
    return (
        <div
            data-aos='fade-in'
            className='group relative w-full rounded-xl bg-white px-4 py-12 text-center dark:bg-gray-900'
        >
            <h3 className='mb-4 text-lg font-semibold text-gray-700 capitalize dark:text-gray-400'>
                {name}
            </h3>
            <div className='mb-8'>
                <h4 className='mb-4 text-3xl font-semibold text-gray-900 capitalize dark:text-gray-100'>
                    {pricingModel === 'monthly' ? price.monthly : price.yearly}
                </h4>
                <p className='text-gray-500'>
                    {pricingModel === 'monthly' ? 'Per month' : 'Per year'}
                </p>
                <p className='mb-6 text-primary-700'>{description}</p>
                <Button
                    color={'primary'}
                    className='px-12!'
                    href={actionButton.url}
                >
                    {actionButton.label}
                </Button>
            </div>

            <ul className='flex flex-col items-center justify-center gap-4 capitalize'>
                {(features ?? []).map((label: string) => (
                    <li key={label}>{label}</li>
                ))}
            </ul>

            <span className='ease absolute top-0 left-0 h-0 w-0 border-t-2 border-violet-600 transition-all duration-200 group-hover:w-full'></span>
            <span className='ease absolute top-0 right-0 h-0 w-0 border-r-2 border-violet-600 transition-all duration-200 group-hover:h-full'></span>
            <span className='ease absolute right-0 bottom-0 h-0 w-0 border-b-2 border-violet-600 transition-all duration-200 group-hover:w-full'></span>
            <span className='ease absolute bottom-0 left-0 h-0 w-0 border-l-2 border-violet-600 transition-all duration-200 group-hover:h-full'></span>
        </div>
    );
};

export default PricePlanCard;
