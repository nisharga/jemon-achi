'use client';
import { motion } from 'framer-motion';

const SocialIcon = ({ children, href = '#' }: any) => {
    return (
        <motion.a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            // Animation Props
            whileHover={{
                y: -5,
                scale: 1.1,
                filter: 'brightness(1.2)'
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 10
            }}
            className='inline-block cursor-pointer rounded-full p-2 transition-colors hover:bg-white/10'
        >
            {children}
        </motion.a>
    );
};
export default SocialIcon;
