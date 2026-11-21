'use client';

import { TriangleAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Badge } from '@/components/ui/admin-badge';

export const PermissionErrorCard = () => {
    const pathname = usePathname();

    return (
        <div className='grid h-full place-items-center'>
            <div className='mx-auto flex h-40 w-full max-w-96 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-background px-10 text-center text-base font-medium text-destructive shadow-md'>
                <TriangleAlert className='mx-auto size-6' />
                <p>You don&apos;t have permission to access this resource.</p>
                <Badge variant='gray'>Path: {pathname}</Badge>
            </div>
        </div>
    );
};
