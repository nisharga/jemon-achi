'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SectionLink = ({ label, url }: any) => {
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');

        // set initial value
        setIsLargeScreen(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => {
            setIsLargeScreen(e.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return (
        <motion.a
            href={url}
            initial={isLargeScreen ? { opacity: 0, x: 20 } : false}
            whileInView={isLargeScreen ? { opacity: 1, x: 0 } : {}}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='base-normal tracking-tight underline'
        >
            {label}
        </motion.a>
    );
};

export default SectionLink;
