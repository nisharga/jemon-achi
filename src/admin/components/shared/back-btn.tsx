'use client';

import React from 'react';
import { Button } from '@/admin/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BackBtn = () => {
    const router = useRouter();
    return (
        <Button
            onClick={() => router.back()}
            variant='outline'
            size='icon'
            className='size-7'
        >
            <ChevronLeft />
        </Button>
    );
};

export default BackBtn;
