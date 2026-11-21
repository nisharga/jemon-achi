'use client';
import FraudCheckerSearchBox from '@/components/shared/fraud-checker-search-box';
import React from 'react';

const page = () => {
    return (
        <div className='py-4'>
            <div className='flex flex-col items-center justify-center gap-4'>
                <h2 className='text-center text-2xl font-medium'>
                    Check Number for Scam!
                </h2>
                <div className='w-[320px] md:w-[450px]'>
                    <FraudCheckerSearchBox inputClass='text-black placeholder:text-black' />
                </div>
            </div>
        </div>
    );
};

export default page;
