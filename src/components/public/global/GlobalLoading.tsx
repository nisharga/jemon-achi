'use client';
import React from 'react';
import { motion } from 'framer-motion';

const GlobalLoading = () => {
    const text = 'GRIIPBUDDY';
    const letters = Array.from(text);

    const containerVariants = {
        visible: {
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const childVariants = (index: number) => ({
        initial: {
            opacity: 0,
            y: 0
        },
        animate: {
            // Enter from bottom, stay, then exit to top
            opacity: [0, 1, 1, 0],
            y: [20, 0, 0, -20],
            transition: {
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1,
                times: [0, 0.1, 0.8, 1],
                ease: 'easeInOut',
                // Logic:
                // Entrance is delayed by index (G first)
                // Exit is offset by (total letters - index) to make Y hide first
                delay: index * 0.1 + (letters.length - index) * 0.05
            }
        }
    });

    return (
        <motion.div className='fixed inset-0 z-[100] flex items-center justify-center bg-[#f5f5f5]'>
            <motion.div
                className='flex overflow-hidden px-4'
                variants={containerVariants}
                initial='initial'
                animate='animate'
            >
                {letters.map((letter, index) => (
                    <motion.span
                        key={index}
                        custom={index}
                        variants={{
                            initial: { opacity: 0, y: 0 },
                            animate: {
                                opacity: [0, 1, 1, 0],
                                y: [20, 0, 0, -20],
                                transition: {
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatDelay: 0.5,
                                    ease: 'easeInOut',
                                    times: [0, 0.15, 0.8, 1],
                                    // Entrance: index * 0.1 (Left to Right)
                                    // The pause before exit is effectively modified by this delay
                                    delay: index * 0.1
                                }
                            }
                        }}
                        // To make the EXIT specifically reverse, we use a different approach:
                        // We use the "exit" transition with staggered delay
                        style={{ display: 'inline-block' }}
                        className='text-2xl font-normal tracking-tighter text-black lg:text-5xl'
                    >
                        {letter === ' ' ? '\u00A0' : letter}
                    </motion.span>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default GlobalLoading;
