import { Loader } from 'lucide-react';
import React from 'react';

export const PermissionLoaderCard = () => {
    return (
        <div className='grid h-full place-items-center'>
            <div className='mx-auto flex h-40 w-full max-w-96 flex-col justify-center gap-2 rounded-md border border-dashed bg-background px-10 text-center text-base font-medium shadow-md'>
                <Loader className='mx-auto size-6 animate-spin' />
                Resource loading...
            </div>
        </div>
    );
};
