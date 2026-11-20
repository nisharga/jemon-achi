import { Loader } from 'lucide-react';
import React from 'react';

const GlobalLoader = () => {
    return (
        <div className='mx-auto flex min-h-[80vh] w-fit items-center justify-center py-4'>
            <Loader className='size-5 animate-spin' />
        </div>
    );
};

export default GlobalLoader;
