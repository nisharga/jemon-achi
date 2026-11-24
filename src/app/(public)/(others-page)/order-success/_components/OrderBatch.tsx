'use client';

import React, { useState } from 'react';
import { Receipt, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface OrderIdBadgeProps {
    invoiceNumber: number | string | undefined;
}

export const OrderIdBadge = ({ invoiceNumber }: OrderIdBadgeProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                invoiceNumber?.toString() || ''
            );
            setCopied(true);
            toast.success('Order ID copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='mb-4'
        >
            <button
                onClick={handleCopy}
                className='group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-200 active:scale-95'
            >
                <Receipt className='h-4 w-4 text-gray-600' />

                <div className='flex items-center gap-2'>
                    <span className='text-[12px] leading-none font-bold tracking-wider text-gray-600 uppercase'>
                        Order ID
                    </span>
                    <span className='text-sm font-semibold tabular-nums md:text-base'>
                        {invoiceNumber}
                    </span>
                </div>

                <div className='ml-2 border-l border-gray-300 pl-2'>
                    <AnimatePresence mode='wait'>
                        {copied ? (
                            <motion.div
                                key='check'
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                            >
                                <Check className='h-4 w-4 text-green-600' />
                            </motion.div>
                        ) : (
                            <motion.div
                                key='copy'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Copy className='h-4 w-4 text-gray-600 group-hover:text-gray-600' />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </button>
        </motion.div>
    );
};
