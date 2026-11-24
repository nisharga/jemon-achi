import type { ReactNode } from 'react';
import { cn } from '@/shop/lib/utils';

type Props = {
    title: string;
    /** Optional link or button shown on the right of the title. */
    action?: ReactNode;
    children: ReactNode;
    className?: string;
};

/** A white box with a title; every dashboard section uses one. */
export default function Panel({ title, action, children, className }: Props) {
    return (
        <section className={cn('rounded-xl bg-white shadow-sm', className)}>
            <header className='flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6'>
                <h2 className='font-semibold text-gray-900'>{title}</h2>
                {action}
            </header>
            {children}
        </section>
    );
}
