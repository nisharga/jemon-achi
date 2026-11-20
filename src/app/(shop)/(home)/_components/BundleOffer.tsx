import { Container } from '@/shop/components/common/container';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const BundleOffer = () => {
    return (
        <Container className='py-2 sm:py-8'>
            <motion.a
                href='/offer'
                className='block rounded-2xl bg-white shadow-sm'
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <Image
                    src='/sample_banner.png'
                    alt={'bundle offer'}
                    width={500}
                    height={500}
                    className='h-full w-full rounded-2xl object-contain'
                />
            </motion.a>
        </Container>
    );
};

export default BundleOffer;
