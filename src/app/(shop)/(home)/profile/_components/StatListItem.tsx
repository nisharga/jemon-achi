import React from 'react';
import { motion } from 'framer-motion';

// Define supported color variants
export type StatVariant =
    'orange' | 'blue' | 'green' | 'red' | 'purple' | 'gray';

interface StatListItemProps {
    label: string;
    value: number | string;
    variant?: StatVariant;
}

const StatListItem = ({
    label,
    value,
    variant = 'gray'
}: StatListItemProps) => {
    // Map variants to Tailwind classes
    const variantClasses: Record<StatVariant, string> = {
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
        gray: 'bg-gray-50 text-gray-600'
    };

    const colorClass = variantClasses[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 * 0.1 }}
            viewport={{ once: true }}
            className={`flex items-center justify-between rounded-lg p-3 ${colorClass.split(' ')[0]}`}
        >
            <span className='sm-medium'>{label}</span>
            <span className={`sm-medium ${colorClass.split(' ')[1]}`}>
                {value}
            </span>
        </motion.div>
    );
};

export default StatListItem;
