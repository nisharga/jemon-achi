import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Container } from '@/shop/components/common/container';
import { useGetBankOffersQuery } from '@/shop/redux/api/offer';
import { getMediaUrl } from '@/shop/lib/get-media-url';

interface IOffer {
    id: number;
    bankLogo: string;
    title: string;
    subtitle: string;
}

const BankOffers = () => {
    const { data, isLoading } = useGetBankOffersQuery({});
    const offers = data ?? [];

    if (isLoading) return <OfferSkeleton />;

    return (
        <Container className='py-2 sm:py-8'>
            <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-6'>
                {offers?.map((offer: IOffer, index: number) => (
                    <motion.div
                        key={offer.id}
                        initial={{
                            opacity: 0,
                            x: index % 2 === 0 ? -30 : 30
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0
                        }}
                        // "once: false" makes it animate every time it enters the screen
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: 'easeOut'
                        }}
                        className='flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-white p-2 shadow-md transition-shadow hover:border-gray-200 lg:gap-6 lg:p-2'
                    >
                        {/* Bank Logo */}
                        <div className='relative h-12 w-24 shrink-0 lg:h-16 lg:w-32'>
                            <Image
                                src={getMediaUrl(offer.bankLogo)}
                                alt={offer.subtitle}
                                fill
                                className='object-contain'
                            />
                        </div>

                        {/* Vertical Divider (Optional/Subtle) */}
                        <div className='hidden h-10 w-[1px] bg-secondary sm:block' />

                        {/* Content */}
                        <div className='flex flex-col justify-center'>
                            <h3 className='xs-normal uppercase'>
                                {offer.title}
                            </h3>
                            <p className='xss-normal mt-1 text-gray-500 uppercase'>
                                {offer.subtitle}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Container>
    );
};

const OfferSkeleton = () => (
    <Container className='py-8'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[1, 2].map((i) => (
                <div
                    key={i}
                    className='h-32 animate-pulse rounded-xl bg-gray-100'
                />
            ))}
        </div>
    </Container>
);

export default BankOffers;
