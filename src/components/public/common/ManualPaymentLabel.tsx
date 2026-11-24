import React from 'react';

interface IProps {
    title: string;
    content: string;
    amount?: number;
}

const ManualPaymentLabel = ({ title, content, amount }: IProps) => {
    return (
        <div className='mb-2 rounded-r-lg border-l-4 border-primary bg-secondary p-2'>
            <div className='flex items-center'>
                <div className='flex-shrink-0'>
                    <svg
                        className='text-primary-ink h-5 w-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                    >
                        <path
                            fillRule='evenodd'
                            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                            clipRule='evenodd'
                        />
                    </svg>
                </div>
                <div className='ml-3'>
                    <p className='text-primary-ink text-sm'>
                        <span className='font-medium'>{title}</span> {content}{' '}
                        {amount && (
                            <span className='text-primary-ink font-medium'>
                                ৳{amount}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManualPaymentLabel;
