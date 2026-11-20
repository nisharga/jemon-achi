'use client';
import React from 'react';
import { motion } from 'framer-motion';

const SectionTitle = ({ title }: any) => {
    return (
        <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='section-title'
        >
            {title}
        </motion.h2>
    );
};

export default SectionTitle;
