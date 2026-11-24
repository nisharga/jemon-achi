'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGetTopBarMessagesQuery } from '@/shop/redux/api/topbar-api';

const SECONDS_PER_MESSAGE = 4;

/** Black announcement strip above the header; rotates the admin's messages. */
export default function TopBar() {
    const { data } = useGetTopBarMessagesQuery({});
    const messages: string[] = data?.data ?? [];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (messages.length < 2) return;
        const timer = setInterval(
            () => setIndex((current) => (current + 1) % messages.length),
            SECONDS_PER_MESSAGE * 1000
        );
        return () => clearInterval(timer);
    }, [messages.length]);

    return (
        <div className='announcement relative w-full overflow-hidden px-4 pt-2 pb-1 text-center'>
            {/* Fixed height, so the header does not jump when the text arrives. */}
            <div className='relative flex h-4 items-center justify-center md:h-5'>
                <AnimatePresence mode='wait'>
                    <motion.p
                        key={index}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className='absolute text-xs font-bold tracking-wide whitespace-nowrap text-white md:text-sm'
                    >
                        {messages[index]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}
