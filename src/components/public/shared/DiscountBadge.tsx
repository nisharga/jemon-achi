'use client'; // Required for Framer Motion in Next.js App Router

import { motion } from 'framer-motion';

interface DiscountBadgeProps {
    label: string;
    percentage?: number;
}

const DiscountBadge: React.FC<DiscountBadgeProps> = ({ label, percentage }) => {
    // Define the animation variants
    const badgeVariants = {
        // 1. Initial State (Hidden/Small)
        initial: {
            opacity: 0,
            scale: 0.5
        },
        // 2. Entrance Animation (Pop in)
        animate: {
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.2 // Slight delay before showing
            }
        },
        // 3. Attention Grabber (Pulse loop)
        pulse: {
            scale: [1, 1.05, 1], // Breathe slightly
            transition: {
                duration: 1.5,
                repeat: Infinity, // Loop forever
                ease: 'easeInOut',
                repeatDelay: 0.5 // Pause between pulses
            }
        }
    };

    return (
        <motion.div
            className='ml-0.5 flex items-center justify-center rounded-full bg-red-600 px-3 pt-[8px] pb-[6px] text-[9px] leading-none font-medium text-white shadow-md lg:text-[10px] lg:uppercase'
            initial='initial'
            animate={['animate', 'pulse']}
            variants={badgeVariants as any}
        >
            {label} {percentage ? `${percentage}% OFF` : ''}
        </motion.div>
    );
};

export default DiscountBadge;
