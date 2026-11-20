import { cn } from '@/admin/lib/utils';
import Link from 'next/link';
import React from 'react';
import { buttonVariants } from '../ui/button';
import { ChevronLeft } from 'lucide-react';

const SectionTitle = ({ title, url }: { title: string; url: string }) => {
    return (
        <div className='flex items-center gap-2'>
            <Link
                href={url}
                className={cn(
                    buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'w-fit'
                    })
                )}
            >
                <ChevronLeft />
            </Link>
            <h1 className='text-2xl font-medium'>{title}</h1>
        </div>
    );
};

export default SectionTitle;
