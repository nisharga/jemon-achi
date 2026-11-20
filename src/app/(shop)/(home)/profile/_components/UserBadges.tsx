'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Badge } from '@/shop/components/ui/badge';
import { cn } from '@/shop/lib/utils';

interface UserBadgesProps {
    userData: {
        status: string;
        userType: string;
        role: string;
    };
}

// 1. Define Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2 // Time delay between each badge (0.2s)
        }
    }
};

const badgeVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
};

export const UserBadges = ({ userData }: UserBadgesProps) => {
    if (!userData) return null;

    const isActive = userData.status === 'ACTIVE';

    return (
        <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='flex flex-wrap items-center gap-2 text-xs'
        >
            {/* 1. Status Badge */}
            <motion.div variants={badgeVariants as any}>
                <Badge
                    variant={isActive ? 'outline' : ('primary' as any)}
                    className={cn(
                        'text-[10px]',
                        isActive
                            ? 'xs-normal border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'xs-normal bg-gray-100 text-gray-800'
                    )}
                >
                    <div
                        className={cn(
                            'mr-1.5 h-1.5 w-1.5 rounded-full text-[10px]',
                            isActive
                                ? 'animate-pulse bg-emerald-500'
                                : 'bg-gray-400'
                        )}
                    />
                    {userData.status}
                </Badge>
            </motion.div>

            {/* 2. User Type Badge */}
            <motion.div variants={badgeVariants as any}>
                <Badge
                    variant='outline'
                    className='border-gray-200 bg-white text-[10px] text-gray-600'
                >
                    <Shield className='mr-1 h-3 w-3' />
                    {userData?.userType}
                </Badge>
            </motion.div>

            {/* 3. Role Badge */}
            <motion.div variants={badgeVariants as any}>
                <Badge className='border-primary bg-primary text-[10px] text-secondary hover:bg-primary/90'>
                    {userData?.role}
                </Badge>
            </motion.div>
        </motion.div>
    );
};
