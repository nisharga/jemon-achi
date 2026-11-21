import { cn } from '@/lib/admin-utils';
import React from 'react';

type ContainerProps = {
    className?: string;
    children: React.ReactNode;
};

const Container = ({ children, className }: ContainerProps) => {
    return (
        <div
            className={cn(
                'mx-auto w-full max-w-lg px-4 sm:max-w-xl md:max-w-2xl lg:max-w-5xl xl:max-w-7xl',
                className
            )}
        >
            {children}
        </div>
    );
};

export default Container;
