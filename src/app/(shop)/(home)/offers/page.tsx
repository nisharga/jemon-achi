'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

const OfferPage = () => {
    return (
        <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6'>
            {/* Soft Background Glows */}
            <div className='pointer-events-none absolute top-[20px] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[80px]' />

            <div className='z-10 w-full max-w-sm text-center'>
                {/* Central Icon */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1
                    }}
                    className='mb-8 inline-flex rounded-3xl bg-primary/10 p-5'
                >
                    <Rocket className='h-10 w-10 text-primary' />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='mb-6 text-4xl leading-[1.1] font-extrabold text-gray-900'
                >
                    Something <span className='text-primary'>Big</span> <br />{' '}
                    is Dropping
                </motion.h1>

                {/* Content */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className='px-2 text-base leading-relaxed font-medium text-gray-500'
                >
                    We are preparing an exclusive collection of offers that will
                    redefine your shopping experience. Unbeatable prices on your
                    favorite categories are just around the corner.
                </motion.p>
            </div>

            {/* Minimal Bottom Label */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className='absolute bottom-12'
            >
                <p className='text-[12px] font-bold tracking-[0.2em] text-gray-300 uppercase'>
                    Launching Early 2026
                </p>
            </motion.div>
        </div>
    );
};

export default OfferPage;
