import { cn } from '@/shop/lib/utils';
import React, { ReactNode } from 'react';

type ContainerProps = {
    children: ReactNode;
    className?: string;
};

export const Container = ({ children, className }: ContainerProps) => {
    return (
        <div
            className={cn(
                'mx-auto w-full max-w-[85rem] px-2 lg:px-4',
                className
            )}
        >
            {children}
        </div>
    );
};
