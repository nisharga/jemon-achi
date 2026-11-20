'use client';
import { motion } from 'framer-motion';

export default function TrackAnimation() {
    return (
        <div className='relative flex h-48 w-full items-end overflow-hidden border-b border-gray-200 bg-gray-50'>
            {/* Static Road */}
            <div className='absolute bottom-0 flex h-12 w-full items-center border-t border-gray-200 bg-gray-100'>
                <div className='mx-4 h-[2px] w-full border-t-2 border-dashed border-gray-300' />
            </div>

            {/* The Moving Car Container */}
            <motion.div
                className='relative z-10 mb-2 flex flex-col items-center'
                initial={{ x: '20vw' }} // Start fully off-screen left
                animate={{ x: '110vw' }} // Drive to off-screen right
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            >
                {/* Car Body with Engine Jitter + Flip */}
                <motion.div
                    animate={{ y: [0, -1.5, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity }}
                    className='relative flex flex-col items-center'
                >
                    {/* scaleX: -1 flips the emoji horizontally 
             so it faces the direction of travel 
          */}
                    <span
                        className='inline-block text-6xl text-primary'
                        style={{ transform: 'scaleX(-1)' }}
                    >
                        🚗
                    </span>

                    {/* Exhaust Smoke - now moved to the right side of the flipped car */}
                    <motion.div
                        className='absolute -right-2 bottom-2 h-1.5 w-1.5 rounded-full bg-secondary opacity-40'
                        animate={{
                            x: [0, 20], // Smoke moves backward (right) as car moves forward (left)
                            y: [0, -8],
                            opacity: [0.6, 0],
                            scale: [1, 2.5]
                        }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                    />
                </motion.div>

                {/* Label using your design system class */}
                <span className='xss-normal mt-1 whitespace-nowrap'>
                    Fast Delivery
                </span>
            </motion.div>
        </div>
    );
}
