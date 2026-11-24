'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    XCircle,
    RefreshCw,
    ArrowLeft,
    Phone,
    Mail,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderFailedPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(15);

    const handleRetry = () => {
        router.push('/checkout');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4 pb-10'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                lang='bn'
                className='w-full max-w-xl rounded-2xl bg-white p-8 text-center'
            >
                {/* Error Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'
                >
                    <XCircle className='h-12 w-12 text-red-500' />
                </motion.div>

                {/* Error Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className='mb-2 text-2xl font-bold text-secondary'>
                        অর্ডার ব্যর্থ হয়েছে!
                    </h1>
                    <h2 className='mb-4 text-xl font-semibold text-red-600'>
                        Order Failed!
                    </h2>
                    <p className='mb-6 text-gray-600'>
                        দুঃখিত, আপনার অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে
                        আবার চেষ্টা করুন।
                    </p>
                </motion.div>

                {/* Error Details */}
                <div className='grid-cols-2 gap-4 md:grid'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'
                    >
                        <div className='mb-2 flex items-center gap-2'>
                            <AlertTriangle className='h-5 w-5 text-red-500' />
                            <span className='font-semibold text-red-700'>
                                Possible Reasons:
                            </span>
                        </div>
                        <ul className='space-y-1 text-left text-sm text-red-600'>
                            <li>• Payment processing failed</li>
                            <li>• Network connection issue</li>
                            <li>• Server temporarily unavailable</li>
                            <li>• Invalid payment information</li>
                        </ul>
                    </motion.div>

                    {/* Retry Instructions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className='mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4'
                    >
                        <h3 className='mb-2 font-semibold text-blue-700'>
                            What to do next:
                        </h3>
                        <ul className='space-y-1 text-left text-sm text-blue-600'>
                            <li>• Check your internet connection</li>
                            <li>• Verify your payment details</li>
                            <li>• Try again in a few minutes</li>
                            <li>• Contact support if problem persists</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className='space-y-3'
                >
                    <button
                        onClick={handleRetry}
                        className='flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
                    >
                        <RefreshCw className='h-5 w-5' />
                        Try Again
                    </button>
                    <button
                        onClick={handleGoHome}
                        className='flex w-full items-center justify-center gap-2 rounded-lg border border-secondary py-3 font-medium text-secondary transition-colors hover:bg-secondary hover:text-white'
                    >
                        <ArrowLeft className='h-5 w-5' />
                        Go to Home
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
