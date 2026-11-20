'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Section = ({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            // Starting state: invisible and 20px lower
            initial={{ opacity: 0, y: 20 }}
            // Animate to this state when in view
            whileInView={{ opacity: 1, y: 0 }}
            // Only animate once (don't repeat every time user scrolls up/down)
            viewport={{ once: true, margin: '-50px' }}
            // Smooth timing
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='space-y-3'
        >
            <h2 className='base-semibold'>{title}</h2>
            <div>{children}</div>
        </motion.div>
    );
};

export default Section;
