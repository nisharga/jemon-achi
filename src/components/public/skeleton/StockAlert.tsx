'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle } from 'lucide-react'; // Or use your own SVG icons

interface StockAlertProps {
    title?: string;
    message?: string;
    isVisible?: boolean;
}

export default function StockAlert({
    title = 'This variant is unavailable now but can be ordered',
    message = 'Our team will reach out to you soon regarding availability. You can still place this order — delivery may take a bit longer than usual.',
    isVisible = true
}: StockAlertProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className='flex max-w-3xl gap-3 rounded-[20px] border border-[#FDE68A] bg-[#FFFBEB] p-4'
                >
                    {/* Icon Section */}
                    <div className='mt-0.5 flex shrink-0 gap-1.5'>
                        <Info
                            className='h-5 w-5 text-[#92400E]'
                            strokeWidth={2}
                        />
                        <span className='text-lg'>⚠️</span>
                    </div>

                    {/* Text Content */}
                    <div className='flex flex-col gap-1'>
                        <h3 className='base-semibold leading-tight !text-[#92400E]'>
                            {title}
                        </h3>
                        <p className='sm-normal-gray leading-relaxed !text-[#B45309]'>
                            {message}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
